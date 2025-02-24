"use client";
import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 flex items-center justify-between p-4 bg-white shadow-sm z-50">
      <div className="flex items-center">
        <Link href="/signin">
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
        <Link href="/about" className="text-gray-800 hover:text-green-500 mx-2">About</Link>
        <Link href="/contact" className="text-gray-800 hover:text-green-500 mx-2">Contact</Link>
        <Link href="/login" className="text-gray-800 hover:text-green-500 mx-2">Login</Link>
      </nav>
    </header>
  );
}