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
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [availableStates, setAvailableStates] = useState<string[]>([]);

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

  useEffect(() => {
    // Filter partners when stateFilter changes
    if (stateFilter === 'all') {
      setFilteredPartners(partners);
    } else {
      setFilteredPartners(partners.filter(partner => partner.state === stateFilter));
    }
  }, [stateFilter, partners]);

  const fetchPartners = async () => {
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (session?.user) {
        headers['Authorization'] = `Bearer ${session.user}`;
      }
  
      const response = await fetch('/api/admin/partners', { headers });
  
      if (!response.ok) {
        throw new Error('Failed to fetch partners');
      }
  
      const data = (await response.json()) as Partner[];
      setPartners(data);
      setFilteredPartners(data);
  
      // Ensure Lagos and Ogun are always included
      const states: string[] = Array.from(new Set([...data.map((partner) => partner.state).filter((state): state is string => state !== null), "Lagos", "Ogun"]))
        .sort();
  
      setAvailableStates(states);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold">Partners</h1>
        
        <div className="mt-4 sm:mt-0">
          <div className="flex items-center space-x-2">
            <label htmlFor="stateFilter" className="text-sm font-medium text-gray-700">
              Filter by State:
            </label>
            <div className="relative">
              <select
                id="stateFilter"
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm bg-white"
              >
                <option value="all">All States</option>
                {availableStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
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
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPartners.length > 0 ? (
                    filteredPartners.map((partner) => (
                      <tr key={partner.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{partner.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{partner.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{partner.firstName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{partner.lastName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{partner.state}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{partner.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(partner.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                        No partners found with the selected filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            Showing {filteredPartners.length} of {partners.length} partners
            {stateFilter !== 'all' && ` (filtered by state: ${stateFilter})`}
          </div>
        </>
      )}
    </div>
  );
}

export default withSessionProvider(PartnersPage);