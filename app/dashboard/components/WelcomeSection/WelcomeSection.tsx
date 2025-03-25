"use client";
import React from "react";
import { useSession } from "next-auth/react";

export default function WelcomeSection() {
  const session = useSession();
  
  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 rounded-lg">
      <h1 className="text-2xl sm:text-3xl lg:text-3xl font-bold text-left">
        👋🏽 Welcome {session.data?.user?.name}
      </h1>
    </div>
  );
}