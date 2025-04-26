// app/reset-password/[token]/page.tsx (Server Component)
import React from "react";
import ResetPasswordPage from "./PartnerResetPassword";

export default async function Page({ params }: { params: { token: string } }) {
  // Here, params.token is available synchronously
  return <ResetPasswordPage token={params.token} />;
}
