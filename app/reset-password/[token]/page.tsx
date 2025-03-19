// app/reset-password/[token]/page.tsx (Server Component)
import React from "react";
import ResetPasswordClient from "./ResetPasswordClient";

export default function Page({ params }: { params: { token: string } }) {
  // Here, params.token is available synchronously
  return <ResetPasswordClient token={params.token} />;
}
