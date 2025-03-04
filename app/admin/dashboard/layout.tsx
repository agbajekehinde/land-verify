// app/admin/layout.tsx
import { ReactNode } from "react";
import SideNav from "./components/sidenav/sidenav";

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
