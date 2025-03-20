"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPasswordClient({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(true);
  const [verifying, setVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const router = useRouter();

  // Password validation
  useEffect(() => {
    if (password && password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
    } else if (confirmPassword && password !== confirmPassword) {
      setPasswordError("Passwords do not match");
    } else {
      setPasswordError(null);
    }
  }, [password, confirmPassword]);

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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

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
        <div className="max-w-xl w-full mx-auto p-8 border rounded-lg shadow-lg bg-white text-center">
          <Link href="/">
            <img src="/LandVerify-logo.png" alt="LandVerify Logo" className="mx-auto mb-6 w-36 h-14"/>
          </Link>
          <h1 className="text-2xl font-bold mb-4">Verifying Reset Link</h1>
          <p>Please wait while we verify your reset link...</p>
          <button onClick={retryVerification} className="mt-6 px-6 py-2 bg-[#479101] text-white rounded-md">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!validToken) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
        <div className="max-w-xl w-full mx-auto p-4 border rounded-lg shadow-lg bg-white text-center">
          <Link href="/">
            <img src="/LandVerify-logo.png" alt="LandVerify Logo" className="mx-auto mb-6 w-36 h-14"/>
          </Link>
          <h1 className="text-2xl font-bold mb-4">Invalid Reset Link</h1>
          <p>This password reset link is invalid or has expired.</p>
          {verificationError && <p className="text-red-500">Error: {verificationError}</p>}
          <Link href="/forgot-password">
            <button className="mt-4 px-6 py-2 bg-[#479101] text-white rounded-md">
              Request New Reset Link
            </button>
          </Link>
          <button onClick={retryVerification} className="mt-4 ml-4 px-6 py-2 bg-gray-200 rounded-md">
            Try Verifying Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="max-w-xl w-full mx-auto p-8 border rounded-lg shadow-lg bg-white">
        <Link href="/">
          <img src="/LandVerify-logo.png" alt="LandVerify Logo" className="mx-auto mb-6 w-36 h-14"/>
        </Link>
        <h1 className="text-2xl font-bold text-center mb-6">Reset Password</h1>
        <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border rounded-md text-base"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full p-3 border rounded-md text-base"
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          {passwordError && (
            <p className="text-red-500 text-sm">{passwordError}</p>
          )}
          
          <button
            type="submit"
            disabled={loading || !!passwordError}
            className={`w-full py-3 ${
              loading || passwordError ? "bg-gray-400" : "bg-[#479101]"
            } text-white rounded-md text-base font-medium`}
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
          <Toaster />
        </form>
      </div>
    </div>
  );
}