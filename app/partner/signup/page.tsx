"use client";

import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import Link from "next/link";

export default function SignupForm() {
  const [form, setForm] = useState<{ firstName: string; lastName: string; email: string; title: string; password: string; phone: string }>({ firstName: "", lastName: "", email: "", password: "", title: "", phone: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
        const response = await fetch("/api/partner-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        toast.success(data.message);
        setForm({ firstName: "", title: "", lastName: "", email: "", password: "", phone: "" });
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
    <div className="flex items-start sm:items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-100">
      <div className="max-w-xl mx-auto p-6 sm:p-8 lg:p-12 border border-gray-300 rounded-lg shadow-lg w-full bg-white">
        <Link href="/">
          <img
            src="/Landverify-partner.svg" alt="LandVerify Partner Logo" className="mb-0 sm:mb-4 lg:mb-4 w-32 h-8 w-16 sm:h-14 lg:w-56 lg:h-13 mx-auto"/>
        </Link>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-4 sm:mb-6 lg:mb-8">
          Sign up as a Partner
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4 p-4 rounded">

        <div className="relative">
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">Title</label>
              <div className="relative">
                <select
                  id="title"
                  name="title"
                  required
                  value={form.title}
                  onChange={handleChange}
                  className="w-full p-2 border rounded bg-white text-gray-700 focus:border-gray-500 appearance-none pr-10"
                >
                  <option value="" className="text-gray-400">Title</option>
                  <option value="Tpl">Tpl</option>
                  <option value="Mr">Mr</option>
                  <option value="Mrs">Mrs</option>
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
              </div>
            </div>

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
            type="number"
            name="phone"
            placeholder="Phone Number"
            required
            value={form.phone}
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
              <Link href="/partner/signin" className="text-[#479101] underline hover:underline">
                Login
              </Link>
            </p>
          </div>
          <p className="text-center text-sm text-gray-400 mt-4">
            By signing up, you agree to the <Link href="/terms-and-conditions" className="underline">LandVerify Terms and Conditions</Link>.
          </p>
        </form>
      </div>
    </div>
  );
}
