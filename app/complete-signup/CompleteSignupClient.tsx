"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

interface FormState {
  fullName: string;
  password: string;
}

interface PasswordStrength {
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export default function CompleteSignup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams ? searchParams.get("token") : null;

  const [form, setForm] = useState<FormState>({ fullName: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [email, setEmail] = useState("");
  const [invalidToken, setInvalidToken] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });
  const [formValid, setFormValid] = useState(false);

  // Verify token on page load
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setInvalidToken(true);
        setVerifying(false);
        return;
      }

      try {
        const response = await fetch(`/api/verify-token?token=${token}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setEmail(data.email);
          setVerifying(false);
        } else {
          setInvalidToken(true);
          setVerifying(false);
          toast.error(data.message || "Invalid or expired token");
        }
      } catch (error) {
        console.error("Error verifying token:", error);
        setInvalidToken(true);
        setVerifying(false);
        toast.error("Failed to verify token");
      }
    };

    verifyToken();
  }, [token]);

  // Check password strength
  useEffect(() => {
    const strength = {
      hasMinLength: form.password.length >= 8,
      hasUpperCase: /[A-Z]/.test(form.password),
      hasLowerCase: /[a-z]/.test(form.password),
      hasNumber: /[0-9]/.test(form.password),
      hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(form.password),
    };
    setPasswordStrength(strength);
  }, [form.password]);

  // Check form validity
  useEffect(() => {
    const isPasswordValid =
      passwordStrength.hasMinLength &&
      passwordStrength.hasUpperCase &&
      passwordStrength.hasLowerCase &&
      passwordStrength.hasNumber &&
      passwordStrength.hasSpecialChar;

    const areAllFieldsFilled = !!form.fullName && !!form.password;
    setFormValid(isPasswordValid && areAllFieldsFilled);
  }, [form, passwordStrength]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const nameParts = form.fullName.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          firstName,
          lastName,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        // Redirect to signin page after successful account creation
        setTimeout(() => {
          router.push("/signin");
        }, 2000);
      } else {
        toast.error(data.message || "Failed to complete signup");
      }
    } catch (error) {
      console.error("Error completing signup:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
        <div className="max-w-md mx-auto p-6 border border-gray-300 rounded-lg shadow-lg bg-white text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Verifying your email...</p>
        </div>
      </div>
    );
  }

  if (invalidToken) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
        <div className="max-w-md mx-auto p-6 border border-gray-300 rounded-lg shadow-lg bg-white text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold mb-4">Invalid or Expired Token</h1>
          <p className="mb-6">This verification link is either invalid or has expired.</p>
          <Link href="/signup" className="bg-[#479101] text-white px-4 py-2 rounded hover:bg-[#3a7a01]">
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-100">
      <div className="max-w-md mx-auto p-6 sm:p-8 lg:p-10 border border-gray-300 rounded-lg shadow-lg w-full bg-white">
        <Link href="/">
          <img
            src="/LandVerify-logo.png"
            alt="LandVerify Logo"
            className="mb-6 sm:mb-8 lg:mb-4 w-32 h-12 sm:w-40 sm:h-14 lg:w-52 lg:h-16 mx-auto"
          />
        </Link>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-4">
          Complete Your Registration
        </h1>

        <div className="mb-6 text-center">
          <p className="text-gray-600">
            Setting up account for: <strong>{email}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            required
            value={form.fullName}
            onChange={handleChange}
            className="block w-full p-3 border rounded hover:border-gray-500 focus:border-gray-500 focus:outline-none"
          />

          {/* Password field with toggle visibility button */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              required
              value={form.password}
              onChange={handleChange}
              className={`block w-full p-3 border rounded focus:border-gray-500 focus:outline-none pr-10 ${
                form.password
                  ? Object.values(passwordStrength).every(Boolean)
                    ? "border-green-500"
                    : "border-yellow-500"
                  : ""
              }`}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>

            {form.password && (
              <div className="mt-2 text-sm">
                <p className="font-semibold mb-1">Password must include:</p>
                <ul>
                  <li className={passwordStrength.hasMinLength ? "text-green-500" : "text-red-500"}>
                    ✓ At least 8 characters
                  </li>
                  <li className={passwordStrength.hasUpperCase ? "text-green-500" : "text-red-500"}>
                    ✓ At least one uppercase letter
                  </li>
                  <li className={passwordStrength.hasLowerCase ? "text-green-500" : "text-red-500"}>
                    ✓ At least one lowercase letter
                  </li>
                  <li className={passwordStrength.hasNumber ? "text-green-500" : "text-red-500"}>
                    ✓ At least one number
                  </li>
                  <li className={passwordStrength.hasSpecialChar ? "text-green-500" : "text-red-500"}>
                    ✓ At least one special character
                  </li>
                </ul>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!formValid || loading}
            className={`w-full py-3 ${
              formValid && !loading
                ? "bg-[#479101] hover:bg-[#3a7a01] cursor-pointer"
                : "bg-gray-400 cursor-not-allowed"
            } text-white font-semibold rounded-md transition-colors`}
          >
            {loading ? "Creating Account..." : "Complete Registration"}
          </button>
        </form>

        <Toaster />
      </div>
    </div>
  );
}