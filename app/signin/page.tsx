"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle, X } from "lucide-react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const router = useRouter();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log("Sending login request:", { email, password });
    const result = await signIn("public", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      toast.error("Invalid email or password");
    } else {
      toast.success("Login successful");
      router.push("/dashboard");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const closeBanner = () => {
    setShowBanner(false);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100">
      {/* Mobile Marketing Banner (Only shown on mobile) */}
      {isMobile && showBanner && (
        <div className="relative w-full bg-blue-100 text-blue-800 p-2 flex justify-between items-center px-8">
          <div className="">
            <h2 className="text-sm font-bold text-blue-900">
             📣 Limited Offer - Act Now to Prevent Demolition
            </h2>
            <p className="text-xs">
              For less than ₦5,000, verify your land and check it complies with states planning regulations. Get result within 48 hours.
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
      )}

      {/* Section 1: Login Form */}
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
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">
            Log In
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4 rounded">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 border rounded hover:border-gray-500 focus:border-gray-500"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full p-2 border rounded hover:border-gray-500 focus:border-gray-500 pr-10"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-[#479101] text-white font-semibold rounded-md hover:bg-[#3a7a01] cursor-pointer"
            >
              {loading ? "Logging In..." : "Log In"}
            </button>
            <Toaster />
            <div className="text-left text-gray-500">
              <p className="md:inline">Forgot your password?</p>{" "}
              <Link
                href="/forgot-password"
                className="text-gray-500 underline hover:underline block md:inline mt-1 md:mt-0 md:ml-1"
              >
                Reset password
              </Link>
            </div>
            <div className="text-left text-gray-500">
              <p className="md:inline">Don&apos;t have an account?</p>{" "}
              <Link
                href="/signup"
                className="text-gray-500 underline hover:underline block md:inline mt-1 md:mt-0 md:ml-1"
              >
                Create account
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Section 2: Marketing Content with Green Background (Hidden on mobile) */}
      <div className="hidden lg:flex w-full lg:w-1/2 bg-gradient-to-br from-emerald-600 via-green-500 to-teal-600 text-white p-6 sm:p-8 lg:p-12 flex-col">

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
        <div className="mt-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-yellow-300 drop-shadow-md">
            Protect Your Property From Demolitions
          </h2>
          
          <div className="bg-white/10 p-4 rounded-lg mb-8 backdrop-blur-sm">
            <h5 className="text-sm sm:text-base font-medium mb-2 text-white">
              For less than <span className="text-yellow-300 font-bold text-lg">₦5,000</span>, get a comprehensive verification report on your land or property within <span className="text-yellow-300 font-bold">48 hours</span>
            </h5>
          </div>
          
          <ul className="space-y-5">
            <li className="flex items-start group transform hover:translate-x-1 transition-all duration-300">
              <div className="mr-3 mt-1 p-1 bg-white/20 rounded-full flex-shrink-0">
                <CheckCircle className="text-yellow-300 group-hover:scale-110 transition-all" size={22} />
              </div>
              <span className="text-white/90 group-hover:text-white transition-all">
                Check with updated public maps from land agencies — we interpret them to give you peace of mind.
              </span>
            </li>
            
            <li className="flex items-start group transform hover:translate-x-1 transition-all duration-300">
              <div className="mr-3 mt-1 p-1 bg-white/20 rounded-full flex-shrink-0">
                <CheckCircle className="text-yellow-300 group-hover:scale-110 transition-all" size={22} />
              </div>
              <span className="text-white/90 group-hover:text-white transition-all">
                Provide a comprehensive report on land characteristics: streams, rivers, power lines or future public infrastructure zones.
              </span>
            </li>
            
            <li className="flex items-start group transform hover:translate-x-1 transition-all duration-300">
              <div className="mr-3 mt-1 p-1 bg-white/20 rounded-full flex-shrink-0">
                <CheckCircle className="text-yellow-300 group-hover:scale-110 transition-all" size={22} />
              </div>
              <span className="text-white/90 group-hover:text-white transition-all">
                Help you understand appropriate setbacks before you build to avoid costly mistakes.
              </span>
            </li>
            
            <li className="flex items-start group transform hover:translate-x-1 transition-all duration-300">
              <div className="mr-3 mt-1 p-1 bg-white/20 rounded-full flex-shrink-0">
                <CheckCircle className="text-yellow-300 group-hover:scale-110 transition-all" size={22} />
              </div>
              <span className="text-white/90 group-hover:text-white transition-all">
                Deploy artificial intelligence on seller documents to verify authenticity and ensure everything matches.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}