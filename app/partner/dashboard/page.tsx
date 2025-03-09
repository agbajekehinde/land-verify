"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import withSessionProvider from "@/app/withSessionProvider";
import PartnerHeader from "./components/partnerheader";
import Spinner from "@/app/dashboard/components/Spinner/spinner";
import Tabs from "@/app/dashboard/components/tabs/tabs";
import WelcomeSection from "@/app/dashboard/components/WelcomeSection/WelcomeSection";
import AccountDetails from "@/app/dashboard/components/accountdetails/AccountDetails";
import VerificationHistory from "./components/VerificationHistory/VerificationHistory";
import { VerificationProvider } from "./components/VerificationContext/VerificationContext";

function Dashboard() {
  const { status } = useSession();
  const router = useRouter();
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
    <VerificationProvider>
      <main>
        <PartnerHeader />
        <div className="flex items-top justify-center min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-100">
          <div className="w-full max-w-3xl">
            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
            
            {activeTab === "verifications" ? (
              <>
                <WelcomeSection />
                <VerificationHistory />
              </>
            ) : (
              <AccountDetails />
            )}
          </div>
        </div>
      </main>
    </VerificationProvider>
  );
}

export default withSessionProvider(Dashboard);