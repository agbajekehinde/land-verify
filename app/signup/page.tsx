"use client";

import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function SignupForm() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch("api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    
    if (response.ok) {
      toast.success(data.message);
      setForm({ firstName: "", lastName: "", email: "" });
    } else {
      toast.error(data.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-100">
      <div className="max-w-xl mx-auto p-6 sm:p-8 lg:p-12 border border-gray-300 rounded-lg shadow-lg w-full bg-white">
        <img src="/LandVerify-logo.png" alt="LandVerify Logo" className="mb-6 sm:mb-8 lg:mb-4 w-32 h-12 sm:w-40 sm:h-14 lg:w-48 lg:h-16 mx-auto"/>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-4 sm:mb-6 lg:mb-8">Create Account</h1>
        <form onSubmit={handleSubmit} className="space-y-4 p-4  rounded">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            required={true}
            value={form.firstName}
            onChange={handleChange}
            className="block w-full p-2 border rounded"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            required={true}
            value={form.lastName}
            onChange={handleChange}
            className="block w-full p-2 border rounded"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            required={true}
            value={form.email}
            onChange={handleChange}
            className="block w-full p-2 border rounded"
          />
          <button type="submit" className="w-full py-2 bg-[#479101] text-white font-semibold rounded-md hover:bg-[#3a7a01]">
            Create Account
          </button>
          <Toaster />
        </form>
      </div>
    </div>
  );
}