'use client';
import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    console.log('Verification Requests Page Session Status:', status);
    console.log('Verification Requests Page Session Details:', session);
    
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
      fetchVerificationRequests();
    }
  }, [status, session]);

  const fetchVerificationRequests = async () => {
    try {
      // Add token from session if available
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (session?.user) {
        headers['Authorization'] = `Bearer ${session.user}`;
      }
      
      const response = await fetch('/api/admin/verification-requests', { headers });
      
      if (!response.ok) {
        throw new Error('Failed to fetch verification requests');
      }
      
      const data = await response.json();
      setRequests(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching verification requests:', error);
      setIsLoading(false);
    }
  };

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
      <h1 className="text-2xl font-bold mb-6">Verification Requests</h1>
      
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
                <th className="py-3 px-4 font-medium">ID</th>
                <th className="py-3 px-4 font-medium">User Email</th>
                <th className="py-3 px-4 font-medium">Address</th>
                <th className="py-3 px-4 font-medium">City</th>
                <th className="py-3 px-4 font-medium">State</th>
                <th className="py-3 px-4 font-medium">Postal Code</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Land Size</th>
                <th className="py-3 px-4 font-medium">Latitude</th>
                <th className="py-3 px-4 font-medium">Longitude</th>
                <th className="py-3 px-4 font-medium">Payment Status</th>
                <th className="py-3 px-4 font-medium">Payment Type</th>
                <th className="py-3 px-4 font-medium">Payment Amount</th>
                <th className="py-3 px-4 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req, index) => (
                <React.Fragment key={req.id}>
                  <tr className="hover:bg-gray-100 transition">
                    <td className="py-3 px-4">{req.id}</td>
                    <td className="py-3 px-4">{req.user?.email || "N/A"}</td>
                    <td className="py-3 px-4">{req.address}</td>
                    <td className="py-3 px-4">{req.city}</td>
                    <td className="py-3 px-4">{req.state}</td>
                    <td className="py-3 px-4">{req.postalCode}</td>
                    <td className="py-3 px-4">{req.status}</td>
                    <td className="py-3 px-4">{req.landsize}</td>
                    <td className="py-3 px-4">{req.latitude}</td>
                    <td className="py-3 px-4">{req.longitude}</td>
                    <td className="py-3 px-4">{req.paymentStatus}</td>
                    <td className="py-3 px-4">{req.paymentType}</td>
                    <td className="py-3 px-4">{req.paymentAmount}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="text-xl font-bold p-2 hover:bg-gray-200">
                        <ActionDropdown id={req.id.toString()} />
                      </div>
                    </td>
                  </tr>
                  {index < requests.length - 1 && (
                    <tr>
                      <td colSpan={14} className="border-t border-gray-300"></td>
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

export default withSessionProvider(VerificationRequestsPage);