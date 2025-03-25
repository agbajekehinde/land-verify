'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import withSessionProvider from '@/app/withSessionProvider';
import Spinner from '@/app/dashboard/components/Spinner/spinner';
import ActionDropdown from '../components/actiondropdown/ActionDropdown';

interface VerificationRequest {
  id: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  status: string;
  landsize: string;
  latitude: number;
  longitude: number;
  paymentStatus: string;
  paymentType: string;
  paymentAmount: number;
  user: {
    email: string;
  } | null;
}

function VerificationRequestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination and Filtering State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
      router.replace('/admin/signin');
    }
  }, [session, status, router]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchVerificationRequests();
    }
  }, [status, session]);

  const fetchVerificationRequests = async () => {
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      const token = (session?.user as { token?: string })?.token;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/admin/verification-requests', { headers });
      if (!response.ok) throw new Error('Failed to fetch verification requests');

      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching verification requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Status Color Mapping
  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      'in progress': 'bg-red-100 text-red-800',
      completed: 'bg-green-100 text-green-800',
    };
    return statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  // Filtered and Sorted Requests
  const filteredAndSortedRequests = useMemo(() => {
    return requests
      .filter(req => {
        const normalizedStatus = req.status.toUpperCase();
        // If "All" then return everything.
        if (statusFilter === 'All') return true;

        if (statusFilter === 'In Progress & Pending') {
          return normalizedStatus === 'IN_PROGRESS' || normalizedStatus === 'PENDING';
        }

        // For single status filters like "Pending", "In Progress", "Completed"
        // we compare after converting the filter to uppercase (and replacing spaces with underscores if needed)
        let filterValue = statusFilter.toUpperCase();
        if (filterValue === 'IN PROGRESS') filterValue = 'IN_PROGRESS';
        
        return normalizedStatus === filterValue;
      })
      .sort((a, b) => {
        // Define a sorting order based on the UPPERCASE status values.
        const statusOrder: Record<string, number> = {
          'PENDING': 1,
          'IN_PROGRESS': 2,
          'COMPLETED': 3,
        };
        const aStatus = a.status.toUpperCase();
        const bStatus = b.status.toUpperCase();
        return (statusOrder[aStatus] || 99) - (statusOrder[bStatus] || 99);
      });
  }, [requests, statusFilter, searchTerm]);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAndSortedRequests.slice(indexOfFirstItem, indexOfLastItem);

  if (status === 'loading') return <Spinner />;
  if (session?.user?.role !== 'admin') return null;

  return (
    <div className="p-4 lg:pl-72">
      <h1 className="text-2xl font-bold mb-6">Verification Requests</h1>

      {/* Filters */}
      <div className="mb-4 flex space-x-4">
        <select 
          value={statusFilter} 
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 border rounded"
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="In Progress & Pending">In Progress & Pending</option>
          <option value="Completed">Completed</option>
        </select>

        <input 
          type="text" 
          placeholder="Search by address, email, or city" 
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 border rounded flex-grow"
        />
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  <th className="py-3 px-4 font-medium">ID</th>
                  <th className="py-3 px-4 font-medium">User Email</th>
                  <th className="py-3 px-4 font-medium">Address</th>
                  <th className="py-3 px-4 font-medium">City</th>
                  <th className="py-3 px-4 font-medium">State</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-100 transition">
                    <td className="py-3 px-4">{req.id}</td>
                    <td className="py-3 px-4">{req.user?.email || "N/A"}</td>
                    <td className="py-3 px-4">{req.address}</td>
                    <td className="py-3 px-4">{req.city}</td>
                    <td className="py-3 px-4">{req.state}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <ActionDropdown id={req.id.toString()} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 border rounded">
              Previous
            </button>
            <span>Page {currentPage} of {Math.ceil(filteredAndSortedRequests.length / itemsPerPage)}</span>
            <button onClick={() => setCurrentPage(prev => (prev < Math.ceil(filteredAndSortedRequests.length / itemsPerPage) ? prev + 1 : prev))} className="px-4 py-2 border rounded">
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default withSessionProvider(VerificationRequestsPage);
