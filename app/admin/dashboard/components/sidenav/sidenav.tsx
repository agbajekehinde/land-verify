"use client";
import React from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function SideNav() {
  const pathname = usePathname();

  const navLinks = [
    { name: "Overview", href: "/admin/dashboard" },
    { name: "Verification Requests", href: "/admin/dashboard/verification-requests" },
    { name: "Customers", href: "/admin/dashboard/customers" },
    { name: "Partners", href: "/admin/dashboard/partners" },
    { name: "Verification Reports", href: "/admin/dashboard/verificationreports" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white text-gray-800 flex flex-col border-r border-gray-200">
      {/* Logo at the top */}
      <div className="p-4 flex items-center justify-center">
        <Link href="/admin/dashboard">
          <img 
            src="/LandVerify-logo.png" 
            alt="LandVerify Logo" 
            className="w-32 h-auto"
          />
        </Link>
      </div>

      {/* Navigation links */}
      <nav className="flex-grow">
        <ul className="flex flex-col space-y-2 px-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link 
                  href={link.href} 
                  className={`block py-2 px-3 rounded ${
                    isActive 
                      ? "bg-gray-200 font-semibold text-gray-900"
                      : "text-gray-600 hover:bg-gray-300 hover:text-gray-900"
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout button at the bottom */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/signin" })}
          className="w-full text-left py-2 px-3 hover:bg-gray-300 hover:text-gray-900 rounded"
        >
          Log Out
        </button>
      </div>
    </aside>
  );
}
