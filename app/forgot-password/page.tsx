"use client";
import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }
      setSubmitted(true);
      toast.success("Password reset link sent to your email");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send reset link"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 sm:p-2 lg:p-4 bg-gray-100">
      <Link href="/">
        <img
          src="/LandVerify-logo.png"
          alt="LandVerify Logo"
          className="mb-6 sm:mb-8 lg:mb-4 w-32 h-12 sm:w-40 sm:h-14 lg:w-52 lg:h-16"
        />
      </Link>
      <div className="w-full max-w-md sm:max-w-xl mx-auto p-6 sm:p-4 lg:p-12 border border-gray-300 rounded-lg shadow-lg bg-white">
        {submitted ? (
          <div className="text-center space-y-4">
            <h1 className="text-2xl sm:text-2xl lg:text-3xl font-bold text-center mb-4 sm:mb-6 lg:mb-8">
              ✉️ <br />Password Reset Link Sent
            </h1>
            <p>A password reset link has been sent to your email.</p>
            <p>
              Please check your inbox and follow the instructions to reset your
              password.
            </p>
            <p>
              <Link href="/signin" className="text-[#479101] underline hover:underline">
                Return to Sign In
              </Link>
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl sm:text-2xl lg:text-3xl font-bold text-center mb-4 sm:mb-6 lg:mb-8">
              Request Password Reset Link
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4 p-4 rounded">
              <p className="text-center mb-4">
                Enter your email address and we&apos;ll send you a link to reset your
                password.
              </p>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="max-w-xl mx-auto block w-full p-2 border rounded hover:border-gray-500 focus:border-gray-500"
              />
              <button
                type="submit"
                className="w-full py-2 bg-[#479101] text-white font-semibold rounded-md hover:bg-[#3a7a01] cursor-pointer"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
              <Toaster />
              <div className="text-center mt-4">
                <Link href="/signin" className="text-[#479101] underline hover:underline">
                  Back to Sign In
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}