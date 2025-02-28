"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function UserHeader() {
  return (
    <header className="sticky top-0 flex items-center justify-between p-4 bg-white shadow-sm z-50">
      {/* Logo Section */}
      <Link href="/dashboard">
        <Image src="/LandVerify-logo.png" alt="LandVerify Logo" width={160} height={80} />
      </Link>

      {/* Navigation */}
      <nav>
        <Link href="/" className="border px-4 py-2 rounded-md hover:bg-gray-100">
          Sign Out
        </Link>
      </nav>
    </header>
  );
}