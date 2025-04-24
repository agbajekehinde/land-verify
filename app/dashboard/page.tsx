"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import withSessionProvider from "../withSessionProvider";
import UserHeader from "./components/header/user-header";
import Spinner from "./components/Spinner/spinner";
import Tabs from "./components/tabs/tabs";
import NewVerification from "./components/newverification/NewVerification";
import VerificationHistory from "./components/verificationshistory/VerificationHistory";
import WelcomeSection from "./components/WelcomeSection/WelcomeSection";
import GetStarted from "./components/getstarted/getstarted";
import AccountDetails from "./components/accountdetails/AccountDetails";
import { VerificationProvider } from "./components/verificationcontext/VerificationContext";

function Dashboard() {
  const { status } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("verifications");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return <Spinner />;
  }

  return (
    <main>
      <UserHeader />
      <div className="flex items-top justify-center min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-100">
        <div className="w-full max-w-3xl">
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
          {activeTab === "verifications" ? (
            <VerificationProvider>
              <div>
                <WelcomeSection />

                <div className="flex flex-col sm:flex-row bg-white p-6 rounded-lg shadow-md items-center justify-between gap-3 sm:gap-4">
                  <p className="block text-gray-600 text-left font-bold text-base sm:font-normal sm:text-base self-start sm:self-auto">
                  Start a new verification request
                  </p>
                  <button
                  onClick={() => setIsOpen(true)}
                  className="w-full lg:w-56 sm:max-w-xs bg-green-600 text-white flex items-center justify-center px-2 py-2 h-12 sm:h-12 text-base font-bold sm:text-base sm:font-medium rounded hover:bg-green-700"
                  >
                  Create New Verification
                  </button>

                  {isOpen && <NewVerification isOpen={isOpen} setIsOpen={setIsOpen} />}
                </div>
                <VerificationHistory/>
                <GetStarted />
              </div>
            </VerificationProvider>
          ) : (
            <AccountDetails />
          )}
        </div>
      </div>
    </main>
  );
}

export default withSessionProvider(Dashboard);