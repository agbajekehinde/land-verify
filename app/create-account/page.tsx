"use client";

import React, { useState } from 'react';
import Link from 'next/link';

const CreateAccountPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle account creation logic here
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-xl mx-auto p-6 sm:p-8 lg:p-12 border border-gray-300 rounded-lg shadow-lg w-full">
        <img src="/LandVerify-logo.png" alt="LandVerify Logo" className="mb-6 sm:mb-8 lg:mb-4 w-32 h-12 sm:w-40 sm:h-14 lg:w-48 lg:h-16 mx-auto"/>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-4 sm:mb-6 lg:mb-8">Create Account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col w-full">
            <label htmlFor="firstName" className="mb-2 font-semibold">First Name:</label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="p-2 border border-gray-300 rounded-md w-full"
            />
          </div>
          <div className="flex flex-col w-full">
            <label htmlFor="lastName" className="mb-2 font-semibold">Last Name:</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="p-2 border border-gray-300 rounded-md w-full"
            />
          </div>
          <div className="flex flex-col w-full">
            <label htmlFor="email" className="mb-2 font-semibold">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="p-2 border border-gray-300 rounded-md w-full"
            />
          </div>
          <button type="submit" className="w-full py-2 bg-[#479101] text-white font-semibold rounded-md hover:bg-[#3a7a01]">
            Create Account
          </button>
        </form>
        <p className="text-center mt-4">
          Already have an account? <Link href="/sign-in" className="text-[#479101] hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default CreateAccountPage;