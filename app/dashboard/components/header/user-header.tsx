"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { signOut } from "next-auth/react";

export default function userHeader() {
  return (
    <header className="sticky top-0 flex items-center justify-between p-4 bg-white shadow-sm z-50">
      <div className="flex items-center">
        <Link href="/dashboard">
          <Image
            src="/LandVerify-logo.png"
            alt="logo"
            width={160}
            height={80}
            className="dark:block"
          />
        </Link>
      </div>
      <nav className="flex items-center gap-4">
      <Link href="/" className="bg-red-500 text-white px-4 py-2 rounded-md">
        Sign Out
      </Link>
      </nav>
    </header>
  );
}