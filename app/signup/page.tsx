"use client";
import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import { CheckCircle, X } from "lucide-react";

export default function EmailVerification() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);

  // Image slider logic
  const images = ["/image 17.png", "/image 18.png", "/image 19.png"];

  useEffect(() => {
    // Check if it's mobile view based on window width
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint in Tailwind
    };

    // Initial check on mount
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile);

    // Set up slider interval
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    // Clean up
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

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
        toast.success(data.message);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Error sending verification:", error);
    } finally {
      setLoading(false);
    }
  };

  const closeBanner = () => {
    setShowBanner(false);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100">
      {/* Mobile Marketing Banner (Only shown on mobile)
      {isMobile && showBanner && (
<div className="relative w-full bg-blue-100 text-blue-800 p-2 flex justify-between items-center px-8">
          <div className="">
            <h2 className="text-sm font-bold text-blue-900">
            📣 Limited Offer - Act Now to Prevent Demolition
            </h2>
            <p className="text-xs">
              For less than ₦10,000, verify a land/property and check it complies with states planning regulations. Get result within 24 hours.
            </p>
          </div>
          <button 
            onClick={closeBanner}
            className="absolute top-1 right-1 text-blue-700 hover:text-blue-900 p-1 rounded-full hover:bg-blue-200 transition-colors"
            aria-label="Close banner"
          >
            <X size={16} />
          </button>
        </div>
      )} */}

      {/* Section 1: Create Account Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center p-4 sm:p-6 lg:p-8">
        <div className="mb-4 lg:mb-8">
          <Link href="/">
            <img
              src="/LandVerify-logo.png"
              alt="LandVerify Logo"
              width={160}
              height={80}
              className="dark:block"
            />
          </Link>
        </div>
        <div className="w-full max-w-md mx-auto p-6 sm:p-8 border border-gray-300 rounded-lg shadow-lg bg-white">
          {!verificationSent ? (
            <>
              <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">
                Create Your Account
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
                  {loading ? "Creating Your Account..." : "Create My Account"}
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
                Log In
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
      {/* Section 2: Marketing Content with Image Slider */}
      <div className="hidden lg:flex w-full lg:w-1/2 bg-gray-200 text-white p-6 sm:p-8 lg:p-12 flex-col">
        {/* Image Slider - Full width */}
        <div className="w-full h-72 relative overflow-hidden rounded-lg mb-8">
          {images.map((img, index) => (
            <div
              key={index}
              className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${
                index === currentImage ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={img}
                alt={`Land Verification ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="mt-2 lg:mt-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-gray-600">
            Protect Your Property From Demolitions
          </h2>
          
          {/* <div className="bg-white/10 p-4 rounded-lg mb-8 backdrop-blur-sm">
            {/* <h5 className="text-sm sm:text-base font-medium mb-2 text-white">
              For less than <span className="text-yellow-300 font-bold text-lg">₦10,000</span>, get a comprehensive verification report on a land or property within <span className="text-yellow-300 font-bold">24 hours</span>
            </h5> */}
     
          
          <ul className="space-y-5">
            <li className="flex items-start group transform hover:translate-x-1 transition-all duration-300">
              <div className="mr-3 mt-1 p-1 bg-white/20 rounded-full flex-shrink-0">
                <CheckCircle className="text-gray-300 group-hover:scale-110 transition-all" size={22} />
              </div>
              <span className="text-gray-500 group-hover:text-gray transition-all">
                Check with updated public maps from land agencies, we interpret them to give you peace of mind.
              </span>
            </li>
            
            <li className="flex items-start group transform hover:translate-x-1 transition-all duration-300">
              <div className="mr-3 mt-1 p-1 bg-white/20 rounded-full flex-shrink-0">
                <CheckCircle className="text-gray-300 group-hover:scale-110 transition-all" size={22} />
              </div>
              <span className="text-gray-500 group-hover:text-gray transition-all">
                Provide a comprehensive report on land characteristics: streams, rivers, power lines or future public infrastructure zones.
              </span>
            </li>
            
            <li className="flex items-start group transform hover:translate-x-1 transition-all duration-300">
              <div className="mr-3 mt-1 p-1 bg-white/20 rounded-full flex-shrink-0">
                <CheckCircle className="text-gray-300 group-hover:scale-110 transition-all" size={22} />
              </div>
              <span className="text-gray-500 group-hover:text-gray transition-all">
                Help you understand appropriate setbacks before you build to avoid costly mistakes.
              </span>
            </li>
            
            <li className="flex items-start group transform hover:translate-x-1 transition-all duration-300">
              <div className="mr-3 mt-1 p-1 bg-white/20 rounded-full flex-shrink-0">
                <CheckCircle className="text-gray-300 group-hover:scale-110 transition-all" size={22} />
              </div>
              <span className="text-gray-500 group-hover:text-gray transition-all">
                Deploy artificial intelligence on seller documents to verify authenticity and ensure everything matches.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}