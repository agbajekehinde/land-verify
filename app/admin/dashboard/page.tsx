'use client';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import withSessionProvider from '@/app/withSessionProvider';
import Spinner from '@/app/dashboard/components/Spinner/spinner';

interface DashboardStats {
  totalRequests: number;
  totalPending: number;
  totalCompleted: number;
  totalReports: number;
  totalUsers: number;
  totalPartners: number;
}

function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats & { isLoading: boolean }>({
    totalRequests: 0,
    totalPending: 0,
    totalCompleted: 0,
    totalReports: 0,
    totalUsers: 0,
    totalPartners: 0,
    isLoading: true
  });

  useEffect(() => {
    console.log('Dashboard Session Status:', status);
    console.log('Dashboard Session Details:', session);
    
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
      fetchDashboardStats();
    }
  }, [status, session]);

  const fetchDashboardStats = async () => {
    try {
      // Add token from session if available
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (session?.user) {
        headers['Authorization'] = `Bearer ${session.user}`;
      }
      
      const response = await fetch('/api/admin/dashboard-stats', { headers });
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      
      const data = await response.json();
      setStats({
        ...data,
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setStats(prev => ({ ...prev, isLoading: false }));
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

  // Actual dashboard content
  return (
    <div className="p-4 lg:pl-72">
      <h1 className="text-2xl font-bold mb-6">Overview</h1>
      
      {stats.isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard 
            title="Total Requests" 
            value={stats.totalRequests} 
            icon={<DocumentIcon />} 
            color="bg-blue-500" 
          />
          <StatCard 
            title="Pending Requests" 
            value={stats.totalPending} 
            icon={<ClockIcon />} 
            color="bg-yellow-500" 
          />
          <StatCard 
            title="Completed Requests" 
            value={stats.totalCompleted} 
            icon={<CheckCircleIcon />} 
            color="bg-green-500" 
          />
          <StatCard 
            title="Verification Reports" 
            value={stats.totalReports} 
            icon={<DocumentTextIcon />} 
            color="bg-purple-500" 
          />
          <StatCard 
            title="Total Customers" 
            value={stats.totalUsers} 
            icon={<UserIcon />} 
            color="bg-indigo-500" 
          />
          <StatCard 
            title="Total Partners" 
            value={stats.totalPartners} 
            icon={<UsersIcon />} 
            color="bg-pink-500" 
          />
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

// Stat Card Component
function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="flex items-center p-4">
        <div className={`${color} p-3 rounded-lg mr-4`}>
          <div className="text-white">{icon}</div>
        </div>
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold">{value.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

// Simple icons for the cards
const DocumentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const DocumentTextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

export default withSessionProvider(AdminDashboard);