"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const sessionData = useSession();
  const router = useRouter();

  useEffect(() => {
    if (sessionData?.status === "unauthenticated") {
      router.push("/signin"); // Redirect if not logged in
    }
  }, [sessionData?.status, router]);

  if (!sessionData) {
    return <p>Loading...</p>; // Show loading while checking session
  }

  if (sessionData.status === "loading") {
    return <p>Loading...</p>; // Show loading while checking session
  }

  return <h1>Welcome to the Dashboard, {sessionData.data?.user?.name}!</h1>;
}
