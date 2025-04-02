'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import withSessionProvider from '@/app/withSessionProvider';
import Spinner from '@/app/dashboard/components/Spinner/spinner';
import ActionDropdown from '../components/reportsactiondropdown/VerificationReportActions';

// Define interfaces for the data structure
interface VerificationReport {
  id: string;
  verificationRequestId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  partner: {
    firstName: string;
    lastName: string;
  } | null;
  verificationRequest: {
    user: {
      email: string | null;
    };
    address: string;
    lga: string;
    state: string;
    postalCode: string;
  };
}

function VerificationReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reports, setReports] = useState<VerificationReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New filtering state
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    console.log('Verification Reports Page Session Status:', status);
    console.log('Verification Reports Page Session Details:', session);
    
    // Redirect logic
    if (status === 'loading') return;
    if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
      console.log('Redirecting due to authentication failure');
      router.replace('/admin/signin');
    }
  }, [session, status, router]);

  useEffect(() => {
    // Only fetch data if authenticated as admin
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchVerificationReports();
    }
  }, [status, session]);

  const fetchVerificationReports = async () => {
    try {
      // Add token from session if available
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (session?.user) {
        headers['Authorization'] = `Bearer ${session.user}`;
      }
      
      const response = await fetch('/api/admin/verification-reports', { headers });
      
      if (!response.ok) {
        throw new Error('Failed to fetch verification reports');
      }
      
      const data = await response.json();
      setReports(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching verification reports:', error);
      setIsLoading(false);
    }
  };

  // Helper function to format dates
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to get appropriate badge color based on status
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800';
      case 'REVIEWED':
        return 'bg-purple-100 text-purple-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Compute filtered reports based on the chosen statusFilter.
  // When "All" is selected, return all reports.
  // Otherwise, match using uppercase values.
  // Also, ensure that 'DRAFT' reports always appear at the top.
  const filteredReports = useMemo(() => {
    const filtered = reports.filter(report => {
      if (statusFilter === 'All') return true;
      return report.status.toUpperCase() === statusFilter;
    });

    return filtered.sort((a, b) => {
      const aDraft = a.status.toUpperCase() === 'DRAFT';
      const bDraft = b.status.toUpperCase() === 'DRAFT';
      if (aDraft && !bDraft) return -1;
      if (bDraft && !aDraft) return 1;
      return 0;
    });
  }, [reports, statusFilter]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return <Spinner />;
  }

  // Prevent rendering if not admin
  if (session?.user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="p-4 lg:pl-72">
      <h1 className="text-2xl font-bold mb-6">Verification Reports</h1>
      
      {/* Filters */}
      <div className="mb-4 flex space-x-4">
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="All">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="APPROVED">Approved</option>
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="text-left text-gray-600 border-b">
                <th className="py-3 px-4 font-medium">Report ID</th>
                {/* Removed Request ID column */}
                <th className="py-3 px-4 font-medium">Partner</th>
                <th className="py-3 px-4 font-medium">User Email</th>
                <th className="py-3 px-4 font-medium">Property Address</th>
                <th className="py-3 px-4 font-medium">Report Status</th>
                <th className="py-3 px-4 font-medium">Created</th>
                <th className="py-3 px-4 font-medium">Last Updated</th>
                <th className="py-3 px-4 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report, index) => (
                <React.Fragment key={report.id}>
                  <tr className="hover:bg-gray-100 transition">
                    <td className="py-3 px-4">{report.id}</td>
                    <td className="py-3 px-4">
                      {report.partner ? `${report.partner.firstName} ${report.partner.lastName}` : "N/A"}
                    </td>
                    <td className="py-3 px-4">{report.verificationRequest.user?.email || "N/A"}</td>
                    <td className="py-3 px-4">
                      {`${report.verificationRequest.address}, ${report.verificationRequest.lga}, ${report.verificationRequest.state}`}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{formatDate(report.createdAt)}</td>
                    <td className="py-3 px-4">{formatDate(report.updatedAt)}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="text-xl font-bold p-2 hover:bg-gray-200">
                        <ActionDropdown reportId={report.id}/>
                      </div>
                    </td>
                  </tr>
                  {index < filteredReports.length - 1 && (
                    <tr>
                      <td colSpan={8} className="border-t border-gray-300"></td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default withSessionProvider(VerificationReportsPage);