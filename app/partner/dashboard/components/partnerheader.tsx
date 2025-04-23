"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function PartnerHeader() {
  const [showModal, setShowModal] = useState(false);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);
  
  return (
    <>
      <header className="sticky top-0 flex items-center justify-between p-4 bg-white shadow-sm z-40">
        {/* Logo Section */}
        <Link href="/dashboard">
          <Image src="/Landverify-partner.png" alt="LandVerify Partner Logo" width={160} height={80} />
        </Link>
        
        {/* Navigation */}
        <nav>
          <button 
            onClick={openModal}
            className="border px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            Sign Out
          </button>
        </nav>
      </header>

      {/* Sign Out Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-blur bg-opacity-70 backdrop-blur-md" 
            onClick={closeModal}
          ></div>
          
          {/* Modal Content */}
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 z-10 relative">
            <h3 className="text-lg font-medium mb-4">Sign Out</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to sign out of your partner account?</p>
            
            <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <Link 
                href="/partner/signin"
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex justify-center"
              >
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}