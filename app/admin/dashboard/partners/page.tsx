'use client';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import withSessionProvider from '@/app/withSessionProvider';
import Spinner from '@/app/dashboard/components/Spinner/spinner';
import { Partner } from '@prisma/client';

function PartnersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('Partners Page Session Status:', status);
    console.log('Partners Page Session Details:', session);
    
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
      fetchPartners();
    }
  }, [status, session]);

  const fetchPartners = async () => {
    try {
      // Add token from session if available
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (session?.user) {
        headers['Authorization'] = `Bearer ${session.user}`;
      }
      
      const response = await fetch('/api/admin/partners', { headers });
      
      if (!response.ok) {
        throw new Error('Failed to fetch partners');
      }
      
      const data = await response.json();
      setPartners(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching partners:', error);
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
      <h1 className="text-2xl font-bold mb-6">Partners</h1>
      
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
                <th className="py-3 px-4 font-medium">Title</th>
                <th className="py-3 px-4 font-medium">First Name</th>
                <th className="py-3 px-4 font-medium">Last Name</th>
                <th className="py-3 px-4 font-medium">Email</th>
                <th className="py-3 px-4 font-medium">Created At</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((partner, index) => (
                <React.Fragment key={partner.id}>
                  <tr className="hover:bg-gray-100 transition">
                    <td className="py-3 px-4">{partner.id}</td>
                    <td className="py-3 px-4">{partner.title}</td>
                    <td className="py-3 px-4">{partner.firstName}</td>
                    <td className="py-3 px-4">{partner.lastName}</td>
                    <td className="py-3 px-4">{partner.email}</td>
                    <td className="py-3 px-4">{new Date(partner.createdAt).toLocaleDateString()}</td>
                  </tr>
                  {index < partners.length - 1 && (
                    <tr>
                      <td colSpan={6} className="border-t border-gray-300"></td>
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

export default withSessionProvider(PartnersPage);