import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(request) {
    const token = request.nextauth.token;
    console.log("🔐 Middleware Triggered");
    console.log("Full Path:", request.nextUrl.pathname);
    console.log("Full Token Details:", JSON.stringify(token, null, 2));

    // Admin dashboard protection
    if (request.nextUrl.pathname.startsWith("/admin/dashboard")) {
      console.log("🕵️ Admin Dashboard Access Attempt");
      console.log("Current Token Role:", token?.role);
      if (!token || token.role !== "admin") {
        console.log("❌ Unauthorized Admin Access - Redirecting");
        return NextResponse.redirect(new URL("/admin/signin", request.url));
      }
    }

    // Partner dashboard protection
    if (request.nextUrl.pathname.startsWith("/partner/dashboard")) {
      console.log("👥 Partner Dashboard Access Attempt");
      console.log("Current Token Role:", token?.role);
      if (!token || token.role !== "partner") {
        console.log("❌ Unauthorized Partner Access - Redirecting");
        return NextResponse.redirect(new URL("/partner/signin", request.url));
      }
    }

    // Regular user dashboard protection
    if (request.nextUrl.pathname === "/dashboard" || request.nextUrl.pathname.startsWith("/dashboard/")) {
      console.log("👤 User Dashboard Access Attempt");
      console.log("Current Token Role:", token?.role);
      if (!token || token.role !== "user") {
        console.log("❌ Unauthorized User Access - Redirecting");
        return NextResponse.redirect(new URL("/signin", request.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token, req }) {
        console.log("🔒 Authorization Check");
        console.log("Token Present:", !!token);
        console.log("Token Role:", token?.role);
        console.log("Path:", req.nextUrl.pathname);
        
        // Determine authorization based on the path
        if (req.nextUrl.pathname.startsWith("/admin/")) {
          return token?.role === "admin";
        }
        
        if (req.nextUrl.pathname.startsWith("/partner/")) {
          return token?.role === "partner";
        }
        
        if (req.nextUrl.pathname === "/dashboard" || req.nextUrl.pathname.startsWith("/dashboard/")) {
          return token?.role === "user";
        }
        
        // For other protected routes that don't need specific roles
        return !!token;
      }
    },
    pages: {
      signIn: "/signin" // Default sign-in page for users
    }
  }
);

export const config = {
  matcher: [
    "/admin/dashboard/:path*",
    "/admin/dashboard",
    "/partner/dashboard/:path*",
    "/partner/dashboard",
    "/dashboard",
    "/dashboard/:path*"
  ]
};