"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

// Update component to accept token as a prop
export default function ResetPasswordPage({ token }: { token: string }) {
  const router = useRouter();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  // Validate token when component mounts
  useEffect(() => {
    async function validateToken() {
      if (!token) return;
      
      try {
        const response = await fetch(`/api/auth/validate-token?token=${token}`);
        const data = await response.json();
        
        if (!response.ok) {
          toast.error(data.message || "Invalid or expired token");
          setIsValid(false);
        } else {
          setIsValid(true);
        }
      } catch {
        toast.error("Failed to validate token");
        setIsValid(false);
      } finally {
        setIsCheckingToken(false);
      }
    }

    if (token) {
      validateToken();
    } else {
      setIsCheckingToken(false);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch("/api/auth/partner-reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }
      
      toast.success("Password reset successful");
      
      // Redirect after successful password reset
      setTimeout(() => {
        router.push("/partner/signin");
      }, 2000);
      
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to reset password"
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Show loading state while checking token
  if (isCheckingToken) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
        <div className="text-center">
          <p>Validating reset link...</p>
        </div>
      </div>
    );
  }
  
  // Show error if token is invalid
  if (!isValid && !isCheckingToken) {
    return (
      <div className="flex flex-col items-center min-h-screen p-4 bg-gray-100">
        <Link href="/">
          <img
            src="/Landverify-partner.svg"
            alt="LandVerify Logo"
            className="mb-8 w-40 h-14"
          />
        </Link>
        <div className="w-full max-w-md mx-auto p-6 border border-gray-300 rounded-lg shadow-lg bg-white text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Reset Link</h1>
          <p className="mb-4">
            This password reset link is invalid or has expired.
          </p>
          <Link href="/partner/forgot-password">
            <button className="px-4 py-2 bg-[#479101] text-white font-semibold rounded-md hover:bg-[#3a7a01]">
              Request New Reset Link
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-gray-100">
      <Link href="/">
        <img
          src="/Landverify-partner.svg"
          alt="LandVerify Logo"
          className="mb-8 w-40 h-14"
        />
      </Link>
      <div className="w-full max-w-md mx-auto p-6 border border-gray-300 rounded-lg shadow-lg bg-white">
        <h1 className="text-2xl font-bold text-center mb-6">
          Reset Your Password
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 border rounded hover:border-gray-500 focus:border-gray-500"
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full p-2 border rounded hover:border-gray-500 focus:border-gray-500"
              minLength={6}
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-[#479101] text-white font-semibold rounded-md hover:bg-[#3a7a01] cursor-pointer"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        <Toaster />
      </div>
    </div>
  );
}