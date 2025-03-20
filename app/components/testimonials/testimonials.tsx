"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

const testimonials = [
  {
    name: 'Emeka A.',
    location: 'Lagos',
    quote: 'LandVerify saved me from buying a disputed property. The verification process was quick and detailed!',
    image: '/hero-desktop.png' // Corrected path
  },
  {
    name: 'Zainab M.',
    location: 'Ogun',
    quote: 'A must-have service for anyone buying property in Nigeria. Highly recommended!',
    image: '/hero-desktop.png' // Corrected path
  }
];

const Testimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000); // Change slide every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  return (
    <div className="container mx-auto p-5 pt-24 py-32">
      <h2 className="text-2xl font-bold text-gray-800 md:text-4xl text-center mb-8">Hear from our clients</h2>
      <div className="relative w-full max-w-3xl mx-auto p-8 bg-white shadow-lg rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <ChevronLeftIcon className="h-6 w-6 text-gray-500 cursor-pointer" onClick={prevSlide} />
          <ChevronRightIcon className="h-6 w-6 text-gray-500 cursor-pointer" onClick={nextSlide} />
        </div>
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src={testimonials[currentIndex].image}
              alt={testimonials[currentIndex].name}
              width={96}
              height={96}
              className="w-24 h-24 rounded-full object-cover"
            />
          </div>
          <p className="text-lg italic text-gray-700 mb-4">&quot;{testimonials[currentIndex].quote}&quot;</p>
          <p className="text-sm font-semibold text-gray-900">– {testimonials[currentIndex].name}, {testimonials[currentIndex].location}</p>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;