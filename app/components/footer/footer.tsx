"use client";
import React from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import WhatsAppButton from '../Whatsappbutton/Whatsappbutton';

export default function Footer() {
  return (
    <footer className="flex flex-col items-center justify-center bg-gray-100 p-6 pt-12 py-24 relative">
      <h2 className="py-3 text-2xl font-bold text-gray-800 md:text-4xl">Verify your land today</h2>
      <h4 className="mt-2 text-lg text-gray-700">Don't fall victim to property fraud. Verify before you buy!</h4>
      <Link
        href="/signup"
        className="mt-4 flex items-center gap-2 rounded-lg bg-green-600 px-8 py-3 text-white hover:bg-green-700"
      >
        <span className="text-bold">Verify a land now</span> <ArrowRightIcon className="h-5 w-5" />
      </Link>
      <p className="mt-4 text-sm text-gray-600">📍 Currently available in Lagos & Ogun states | More states coming soon!</p>
      <div className='mt-8'>
        <p className="mt-2 text-sm text-gray-600 pt-2">All rights reserved (c) 2025</p>
      </div>
      <WhatsAppButton/>
    </footer>
  );
}