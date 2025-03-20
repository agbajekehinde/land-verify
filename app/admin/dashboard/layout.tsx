// app/admin/layout.tsx
import React from "react";
import { ReactNode } from "react";
import SideNav from "./components/sidenav/sidenav";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LandVerify',
  description: 'LandVerify - Secure your property investment with confidence.',
  metadataBase: new URL('https://landverify.com'),
  icons: {
    icon: '/favicon.png'
  },
};

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex h-screen">
    
      <SideNav />

      <main className="flex-grow p-4 bg-gray-100">
        {children}
      </main>
    </div>
  );
}
