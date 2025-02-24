"use client";
import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false, // Prevent NextAuth from automatically redirecting
    });

    setLoading(false);

    if (result?.error) {
      toast.error("Invalid email or password");
    } else {
      toast.success("Login successful");
      router.push("/dashboard"); // Redirect after successful login
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-100">
      <div className="max-w-xl mx-auto p-6 sm:p-8 lg:p-12 border border-gray-300 rounded-lg shadow-lg w-full bg-white">
        <Link href="/">
          <img src="/LandVerify-logo.png" alt="LandVerify Logo" className="mb-6 sm:mb-8 lg:mb-4 w-32 h-12 sm:w-40 sm:h-14 lg:w-48 lg:h-16 mx-auto"/>
        </Link>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-4 sm:mb-6 lg:mb-8">Sign In</h1>
        <form onSubmit={handleSubmit} className="space-y-4 p-4 rounded">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="block w-full p-2 border rounded hover:border-gray-500 focus:border-gray-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="block w-full p-2 border rounded hover:border-gray-500 focus:border-gray-500"
          />
          <button type="submit" className="w-full py-2 bg-[#479101] text-white font-semibold rounded-md hover:bg-[#3a7a01] cursor-pointer">
            {loading ? "Signing In..." : "Sign In"}
          </button>
          <div>
            <p className="text-center mt-4">Don&apos;t have an account? <Link href="/signup" className="text-[#479101] hover:underline">Sign Up</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
}
