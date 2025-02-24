"use client";

import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

export default function SignupForm() {
  const [form, setForm] = useState<{ firstName: string; lastName: string; email: string; password: string; }>({ firstName: "", lastName: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        toast.success(data.message);
        setForm({ firstName: "", lastName: "", email: "", password: "" });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      setLoading(false);
      toast.error("An unexpected error occurred");
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-100">
      <div className="max-w-xl mx-auto p-6 sm:p-8 lg:p-12 border border-gray-300 rounded-lg shadow-lg w-full bg-white">
        <Link href="/">
          <img
            src="/LandVerify-logo.png"
            alt="LandVerify Logo"
            className="mb-6 sm:mb-8 lg:mb-4 w-32 h-12 sm:w-40 sm:h-14 lg:w-48 lg:h-16 mx-auto"
          />
        </Link>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-4 sm:mb-6 lg:mb-8">
          Create Account
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4 p-4 rounded">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            required
            value={form.firstName}
            onChange={handleChange}
            className="block w-full p-2 border rounded hover:border-gray-500 focus:border-gray-500"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            required
            value={form.lastName}
            onChange={handleChange}
            className="block w-full p-2 border rounded hover:border-gray-500 focus:border-gray-500"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={handleChange}
            className="block w-full p-2 border rounded hover:border-gray-500 focus:border-gray-500"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            value={form.password}
            onChange={handleChange}
            className="block w-full p-2 border rounded hover:border-gray-500 focus:border-gray-500"
          />
          <button
            type="submit"
            className="w-full py-2 bg-[#479101] text-white font-semibold rounded-md hover:bg-[#3a7a01] cursor-pointer"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
          <Toaster />
          <div>
            <p className="text-center mt-4">
              Already have an account?{" "}
              <Link href="/signin" className="text-[#479101] hover:underline">
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
