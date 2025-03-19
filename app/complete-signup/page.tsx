"use client";
import React from "react";
import { Suspense } from "react";
import CompleteSignup from "./CompleteSignupClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CompleteSignup />
    </Suspense>
  );
}