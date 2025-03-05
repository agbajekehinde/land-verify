"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Trim the inputs to remove accidental whitespace
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    console.log("🔐 Attempting Admin Login", { 
      email: trimmedEmail, 
      passwordLength: trimmedPassword.length 
    });

    try {
      const result = await signIn("admin", {
        email: trimmedEmail,
        password: trimmedPassword,
        redirect: false,
      });

      console.log("🌐 Sign-in Result:", result);

      setLoading(false);

      if (result?.error) {
        console.error("❌ Login Error:", result.error);
        toast.error(`Login failed: ${result.error}`);
        return;
      }

      if (result?.ok) {
        console.log("✅ Login Successful");
        toast.success("Login successful");
        
        // Delay to ensure toast is visible
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 1000);
        return;
      }

      // If result is undefined or unexpected
      console.warn("❓ Unexpected sign-in result");
      toast.error("An unexpected error occurred");
    } catch (error) {
      console.error("🚨 Unexpected Error during login:", error);
      toast.error("An unexpected error occurred");
      setLoading(false);
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
          Sign In as Admin
        </h1>
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
          <button
            type="submit"
            className="w-full py-2 bg-[#479101] text-white font-semibold rounded-md hover:bg-[#3a7a01] cursor-pointer"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
          <Toaster />
        </form>
      </div>
    </div>
  );
}