"use client";
import React from 'react';

import Image from 'next/image';

export default function Steps() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2">
          <h2 className="text-2xl font-bold text-gray-800 md:text-4xl">How It Works</h2>
          <div className="mt-6 space-y-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#479101] text-white">1</span>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-gray-800">Submit Property Details</h3>
                <p className="mt-2 text-gray-600">Provide basic information about the land or home you want to verify.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#479101] text-white">2</span>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-gray-800">Expert Review</h3>
                <p className="mt-2 text-gray-600">Our certified professionals analyze legal documents and authentic public records.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#479101] text-white">3</span>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-gray-800">Verification Report</h3>
                <p className="mt-2 text-gray-600">Receive a detailed report on property authenticity within 48 hours to 7 days.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 md:mt-0 md:w-1/2 flex justify-center">
          <Image
            src="/steps-image.png"
            alt="Steps illustration"
            width={500}
            height={800}
            className="rounded-lg shadow-md"
          />
        </div>
      </div>
    </section>
  );
}