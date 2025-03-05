import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(request) {
    const token = request.nextauth.token;
    
    console.log("🔐 Middleware Triggered");
    console.log("Full Path:", request.nextUrl.pathname);
    console.log("Full Token Details:", JSON.stringify(token, null, 2));

    // More comprehensive admin dashboard protection
    if (request.nextUrl.pathname.startsWith("/admin/dashboard")) {
      console.log("🕵️ Admin Dashboard Access Attempt");
      console.log("Current Token Role:", token?.role);
      
      if (!token || token.role !== "admin") {
        console.log("❌ Unauthorized Admin Access - Redirecting");
        return NextResponse.redirect(new URL("/admin/signin", request.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token }) {
        console.log("🔒 Authorization Check");
        console.log("Token Present:", !!token);
        console.log("Token Role:", token?.role);
        return token?.role === "admin";
      }
    },
    pages: {
      signIn: "/admin/signin"
    }
  }
);

export const config = {
  matcher: [
    "/admin/dashboard/:path*", 
    "/admin/dashboard"  // Add exact dashboard route
  ]
};