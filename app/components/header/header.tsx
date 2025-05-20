"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X } from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const [showBanner, setShowBanner] = useState(true);
  const closeBanner = () => {
    setShowBanner(false);
  };
  
  return (
    <header className="sticky top-0 bg-white shadow-sm z-50">
      {showBanner && (
        <div className="relative w-full bg-blue-100 text-blue-800 p-2 flex justify-between items-center px-8">
          <div className="">
            <h2 className="text-sm font-bold text-blue-900">
              📣 Limited Offer - Act Now to Prevent Demolition
            </h2>
            <p className="text-xs">
              For less than ₦10,000, verify your land and check it complies with states planning regulations. Get result within 24 hours.
            </p>
          </div>
          <button 
            onClick={closeBanner}
            className="absolute top-1 right-1 text-blue-700 hover:text-blue-900 p-1 rounded-full hover:bg-blue-200 transition-colors"
            aria-label="Close banner"
          >
            <X size={16} />
          </button>
        </div>
      )}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <Link href="/">
            <Image
              src="/LandVerify-logo.png"
              alt="logo"
              width={160}
              height={80}
              className="dark:block"
            />
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          <Link href="/about-us" className="text-gray-800 hover:text-green-500 mx-2">About</Link>
          <Link href="/contact-us" className="text-gray-800 hover:text-green-500 mx-2">Contact</Link>
          <Link href="/signin" className="text-gray-800 hover:text-green-500 mx-2">Login</Link>
        </nav>
        
        {/* Hamburger Menu Button */}
        <button
          className="md:hidden p-2 focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <div className="w-6 h-5 flex flex-col justify-between">
            <span className={`h-0.5 w-full bg-gray-800 rounded-lg transform transition duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`h-0.5 w-full bg-gray-800 rounded-lg transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
            <span className={`h-0.5 w-full bg-gray-800 rounded-lg transform transition duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </div>
        </button>
      </div>
      
      {/* Mobile Navigation - Now absolute positioned */}
      {isMenuOpen && (
        <nav className="md:hidden absolute left-0 right-0 bg-white border-t flex flex-col shadow-md">
          <Link
            href="/about-us"
            className="text-gray-800 hover:text-green-500 py-3 px-4 border-b"
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </Link>
          <Link
            href="/contact-us"
            className="text-gray-800 hover:text-green-500 py-3 px-4 border-b"
            onClick={() => setIsMenuOpen(false)}
          >
            Contact
          </Link>
          <Link
            href="/signin"
            className="text-gray-800 hover:text-green-500 py-3 px-4"
            onClick={() => setIsMenuOpen(false)}
          >
            Login
          </Link>
        </nav>
      )}
    </header>
  );
}