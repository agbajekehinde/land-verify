"use client";
import React from 'react';

import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import '@/app/ui/global.css';
import Image from 'next/image';

export default function Hero() {
  return (
    <div className="flex flex-col items-center justify-center bg-[#00000] p-2 pt-12 py-32 md:pt-24 md:pb-32">
      <div className="flex grow flex-col gap-4 md:flex-row items-center justify-top px-6 py-2 md:px-20">
        <div className="flex flex-col justify-center items-start gap-6 rounded-lg bg-white p-6 md:w-1/2">
          <h1 className="flex text-4xl text-gray-900 md:text-4xl md:leading-bold">
            <strong>Protect Your Property Investment with Expert-Verified Reports</strong>
          </h1>
          <p>
            Avoid demolitions and legal risks. Check compliance with states survey, physical planning regulations and other 20+ environmental risks. Powered by advanced GIS technology and team of expert surveyors, town planners, and lawyers. Get comprehensive report within 24 hours!
          </p>
          <div className="flex flex-col gap-4 md:flex-row w-full">
            <Link
              href="/signup"
              className="flex w-full md:w-auto items-center justify-center gap-5 rounded-lg bg-[#3a7a01] px-6 py-4 md:py-3 text-sm font-medium text-white transition-colors hover:bg-[#3a7a01] md:text-base"
            >
              <span>Start Verification</span> <ArrowRightIcon className="w-5 md:w-6" />
            </Link>
            <Link
              href="/about-us"
              className="flex w-full md:w-auto items-center justify-center gap-5 rounded-lg border border-[#479101] px-6 py-4 md:py-3 text-sm font-medium text-[#479101] transition-colors hover:bg-[#e6f4e1] md:text-base"
            >
              <span>Learn More</span>
            </Link>
          </div>
          <p className="text-xs">
            <span>🚀 Pilot Phase: Currently available in Lagos, Ogun, Oyo, and the FCT.</span>
          </p>
        </div>
        <div className="">
          {/* Add Hero Images Here */}
          <Image
            src="/hero-desktop.png"
            layout="responsive"
            width={1920}
            height={1080}
            className="hidden md:block"
            alt="Hero Desktop"
            priority
          />
          <Image
            src="/hero-desktop.png"
            layout=""
            width={560}
            height={620}
            className="hidden"
            alt="Hero Mobile"
            priority
          />
        </div>
      </div>
    </div>
  );
}