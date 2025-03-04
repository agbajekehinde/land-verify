import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(request) {
    const token = request.nextauth.token;
    // For admin routes, check if the token has an admin role.
    if (request.nextUrl.pathname.startsWith("/admin/dashboard") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/admin/signin", request.url));
    }
    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/signin", // Redirect unauthenticated users to this sign-in page.
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/admin/dashboard/:path*"],
};
