"use client";
import React from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Typeform from '../Typeform/typeform';

export default function Footer() {
  return (
    <footer className="flex flex-col items-center justify-center bg-gray-100 p-6 pt-12 py-24 relative">
      <h2 className="py-3 text-2xl font-bold text-gray-800 md:text-4xl">Verify your land today</h2>
      <h4 className="mt-2 text-lg text-gray-700">Don&apos;t fall victim to property fraud. Verify before you buy!</h4>
      <div className='py-2'> </div>
      <Link
          href="/signup"
          className="flex w-full md:w-auto items-center justify-center gap-5 rounded-lg bg-[#3a7a01] px-6 py-4 md:py-3 text-sm md:text-2xl font-bold text-white transition-colors hover:bg-[#3a7a01]"
        >
          <span>Start Verification Now</span> 
          <ArrowRightIcon className="w-5 md:w-7" />
        </Link>
      <p className="mt-8 text-sm text-gray-600">📍 Currently available in Lagos & Ogun states | More states coming soon!</p>
      <div className='mt-4'> </div>
      <p className='mt-8 text-sm text-center text-gray-400'>LandVerify.ng is a product and property of LandVerify Digital Services, a company registered with the <br></br> Nigeria Corporate Affairs Commission with RC Number: XXXXX </p>
      <p className="mt-4 text-sm text-gray-400 pt-2">All rights reserved (c) 2025</p>

      <Typeform/>
    </footer>
  );
}
