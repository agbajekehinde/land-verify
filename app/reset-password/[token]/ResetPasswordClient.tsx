"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

export default function ResetPasswordClient({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(true);
  const [verifying, setVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setVerificationError("No token provided");
        setValidToken(false);
        setVerifying(false);
        return;
      }
      
      try {
        const response = await fetch(`/api/auth/verify-reset-token?token=${token}`);
        const data = await response.json();
        
        if (!response.ok) {
          setValidToken(false);
          setVerificationError(data.message || "Invalid or expired reset link");
          toast.error(data.message || "Invalid or expired reset link");
        } else {
          setValidToken(true);
        }
      } catch {
        setValidToken(false);
        setVerificationError("Could not verify reset token");
        toast.error("Could not verify reset token");
      } finally {
        setVerifying(false);
      }
    };
    
    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }
      
      toast.success("Password reset successfully");
      setTimeout(() => {
        router.push("/signin");
      }, 2000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const retryVerification = async () => {
    setVerifying(true);
    setVerificationError(null);
    
    try {
      const response = await fetch(`/api/auth/verify-reset-token?token=${token}`);
      const data = await response.json();
      
      if (!response.ok) {
        setValidToken(false);
        setVerificationError(data.message || "Invalid or expired reset link");
        toast.error(data.message || "Invalid or expired reset link");
      } else {
        setValidToken(true);
      }
    } catch {
      setValidToken(false);
      setVerificationError("Could not verify reset token");
      toast.error("Could not verify reset token");
    } finally {
      setVerifying(false);
    }
  };

  if (verifying) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
        <div className="max-w-xl mx-auto p-6 border rounded-lg shadow-lg bg-white text-center">
          <Link href="/">
            <img src="/LandVerify-logo.png" alt="LandVerify Logo" className="mx-auto mb-6 w-32 h-12"/>
          </Link>
          <h1 className="text-2xl font-bold mb-4">Verifying Reset Link</h1>
          <p>Please wait while we verify your reset link...</p>
          <button onClick={retryVerification} className="mt-6 px-4 py-2 bg-[#479101] text-white rounded-md">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!validToken) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
        <div className="max-w-xl mx-auto p-6 border rounded-lg shadow-lg bg-white text-center">
          <Link href="/">
            <img src="/LandVerify-logo.png" alt="LandVerify Logo" className="mx-auto mb-6 w-32 h-12"/>
          </Link>
          <h1 className="text-2xl font-bold mb-4">Invalid Reset Link</h1>
          <p>This password reset link is invalid or has expired.</p>
          {verificationError && <p className="text-red-500">Error: {verificationError}</p>}
          <Link href="/forgot-password">
            <button className="mt-4 px-4 py-2 bg-[#479101] text-white rounded-md">
              Request New Reset Link
            </button>
          </Link>
          <button onClick={retryVerification} className="mt-4 px-4 py-2 bg-gray-200 rounded-md">
            Try Verifying Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="max-w-xl mx-auto p-6 border rounded-lg shadow-lg bg-white">
        <Link href="/">
          <img src="/LandVerify-logo.png" alt="LandVerify Logo" className="mx-auto mb-6 w-32 h-12"/>
        </Link>
        <h1 className="text-2xl font-bold text-center mb-4">Reset Password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-[#479101] text-white rounded-md"
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
          <Toaster />
        </form>
      </div>
    </div>
  );
}
