"use client";
import React from 'react';

import { ShieldCheckIcon, UserGroupIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function KeyFeatures() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 md:text-4xl">Why LandVerify?</h2>
        <div className="mt-10 flex flex-col gap-8 md:flex-row md:gap-12">
          <div className="flex flex-1 flex-col items-center text-center p-6 bg-white rounded-lg shadow-md h-64">
            <ShieldCheckIcon className="w-12 h-12 text-[#479101]" />
            <h3 className="mt-4 text-xl font-semibold text-gray-800">Combat Fraud</h3>
            <p className="mt-2 text-gray-600">Protect yourself from fake land titles, double sales, and forged documents.</p>
          </div>
          <div className="flex flex-1 flex-col items-center text-center p-6 bg-white rounded-lg shadow-md h-64">
            <UserGroupIcon className="w-12 h-12 text-[#479101]" />
            <h3 className="mt-4 text-xl font-semibold text-gray-800">Expert Verification</h3>
            <p className="mt-2 text-gray-600">A dedicated team of licensed town planners, surveyors, and legal professionals with extensive experience.</p>
          </div>
          <div className="flex flex-1 flex-col items-center text-center p-6 bg-white rounded-lg shadow-md h-64">
            <ClockIcon className="w-12 h-12 text-[#479101]" />
            <h3 className="mt-4 text-xl font-semibold text-gray-800">Fast & Reliable</h3>
            <p className="mt-2 text-gray-600">Get results between 5-7 working days or as quick as 24 hours.</p>
          </div>
        </div>
      </div>
    </section>
  );
}