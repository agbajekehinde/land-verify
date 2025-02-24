import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/signin", // Redirect unauthenticated users to sign-in page
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"], // Protect these routes
};
