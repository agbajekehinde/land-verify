import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(true);
  const [verifying, setVerifying] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams ? searchParams.get("token") : null;

  useEffect(() => {
    // Verify token validity once the router is ready
    const verifyToken = async () => {
      if (!token) return;
      
      try {
        const response = await fetch(`/api/auth/verify-reset-token?token=${token}`);
        const data = await response.json();
        
        if (!response.ok) {
          setValidToken(false);
          toast.error(data.message || "Invalid or expired reset link");
        }
      } catch {
        setValidToken(false);
        toast.error("Could not verify reset token");
      } finally {
        setVerifying(false);
      }
    };
    
    if (token) {
      verifyToken();
    }
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
        headers: {
          "Content-Type": "application/json",
        },
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

  if (verifying) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-100">
        <div className="max-w-xl mx-auto p-6 sm:p-8 lg:p-12 border border-gray-300 rounded-lg shadow-lg w-full bg-white text-center">
          <Link href="/">
            <img src="/LandVerify-logo.png" alt="LandVerify Logo" className="mb-6 sm:mb-8 lg:mb-4 w-32 h-12 sm:w-40 sm:h-14 lg:w-52 lg:h-16 mx-auto"/>
          </Link>
          <h1 className="text-2xl font-bold mb-4">Verifying Reset Link</h1>
          <p>Please wait while we verify your reset link...</p>
        </div>
      </div>
    );
  }

  if (!validToken) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-100">
        <div className="max-w-xl mx-auto p-6 sm:p-8 lg:p-12 border border-gray-300 rounded-lg shadow-lg w-full bg-white text-center">
          <Link href="/">
            <img src="/LandVerify-logo.png" alt="LandVerify Logo" className="mb-6 sm:mb-8 lg:mb-4 w-32 h-12 sm:w-40 sm:h-14 lg:w-52 lg:h-16 mx-auto"/>
          </Link>
          <h1 className="text-2xl font-bold mb-4">Invalid Reset Link</h1>
          <p className="mb-4">This password reset link is invalid or has expired.</p>
          <Link href="/forgot-password">
            <button className="px-4 py-2 bg-[#479101] text-white font-semibold rounded-md hover:bg-[#3a7a01]">
              Request New Reset Link
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-100">
      <div className="max-w-xl mx-auto p-6 sm:p-8 lg:p-12 border border-gray-300 rounded-lg shadow-lg w-full bg-white">
        <Link href="/">
          <img src="/LandVerify-logo.png" alt="LandVerify Logo" className="mb-6 sm:mb-8 lg:mb-4 w-32 h-12 sm:w-40 sm:h-14 lg:w-52 lg:h-16 mx-auto"/>
        </Link>
        <h1 className="text-2xl sm:text-2xl lg:text-3xl font-bold text-center mb-4 sm:mb-6 lg:mb-8">Reset Password</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4 p-4 rounded">
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="max-w-xl mx-auto block w-full p-2 border rounded hover:border-gray-500 focus:border-gray-500"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="block w-full p-2 border rounded hover:border-gray-500 focus:border-gray-500"
          />
          <button 
            type="submit" 
            className="w-full py-2 bg-[#479101] text-white font-semibold rounded-md hover:bg-[#3a7a01] cursor-pointer"
            disabled={loading}
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
          <Toaster />
        </form>
      </div>
    </div>
  );
}