'use client';
import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import withSessionProvider from '@/app/dashboard/withSessionProvider';
import Spinner from '@/app/dashboard/components/Spinner/spinner';

function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

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
    <main>
      <h1>Admin Dashboard</h1>
      {/* Your existing dashboard content */}
    </main>
  );
}

export default withSessionProvider(AdminDashboard);