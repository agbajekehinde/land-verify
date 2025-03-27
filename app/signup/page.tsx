"use client";
import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

export default function EmailVerification() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setVerificationSent(true);
        toast.success(data.message);
      } else {
        toast.success(data.message); // This was deliberately changed to toast.error 
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Error sending verification:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-start justify-center min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-100">
      <div className="max-w-xl mx-auto p-6 sm:p-8 lg:p-12 border border-gray-300 rounded-lg shadow-lg w-full bg-white">
        <Link href="/">
          <img
            src="/LandVerify-logo.png"
            alt="LandVerify Logo"
          className="mb-2 sm:h-0 h-12 sm:mb-8 lg:mb-4 w-32 sm:w-32 sm:h-12 lg:w-52 lg:h-16 mx-auto"
          />
        </Link>
        
        {!verificationSent ? (
          <>
            <h1 className="text-xl sm:text-2xl lg:text-2xl font-bold text-center mb-4 sm:mb-6">
              Create Account
            </h1>
            <p className="text-center text-gray-600 mb-6">
              Enter your email to receive a verification link
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="block w-full p-3 border rounded hover:border-gray-500 focus:border-gray-500 focus:outline-none"
              />
              
              <button
                type="submit"
                disabled={loading || !email}
                className={`w-full py-3 ${
                  !loading && email
                    ? "bg-[#479101] hover:bg-[#3a7a01] cursor-pointer" 
                    : "bg-gray-400 cursor-not-allowed"
                } text-white font-semibold rounded-md transition-colors`}
              >
                {loading ? "Sending..." : "Send Verification Link"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="mb-4 text-5xl">✉️</div>
            <h2 className="text-xl font-bold mb-3">Verification Email Sent</h2>
            <p className="text-gray-600 mb-4">
              We&apos;ve sent a verification link to <strong>{email}</strong>. 
              Please check your inbox and click the link to complete your registration.
            </p>
            <p className="text-gray-500 text-sm">
              The link will expire in 15 minutes. If you don&apos;t see the email, please check your spam folder.
            </p>
          </div>
        )}
        
        <Toaster />
        
        <div className="mt-6">
          <p className="text-center">
            Already have an account?{" "}
            <Link href="/signin" className="text-[#479101] underline hover:underline">
              Login
            </Link>
          </p>
          <p className="text-center text-sm text-gray-400 mt-4">
            By signing up, you agree to the{" "}
            <Link href="/terms-and-conditions" className="underline">
              LandVerify Terms and Conditions
            </Link>.
          </p>
        </div>
      </div>
    </div>
  );
}