import NextAuth, { AuthOptions, SessionStrategy } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: string;
    } & DefaultSession["user"];
  }
}

const prisma = new PrismaClient();

export const authOptions: AuthOptions = {
  session: { strategy: "jwt" as SessionStrategy },
  providers: [
    // Admin Credentials Provider
    CredentialsProvider({
      id: "admin",
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "admin@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing credentials");
          throw new Error("Missing email or password");
        }

        // Trim input credentials
        const inputEmail = credentials.email.trim();
        const inputPassword = credentials.password.trim();

        // Retrieve and trim admin credentials from environment variables
        const adminEmail = process.env.ADMIN_EMAIL?.trim();
        const adminPassword = process.env.ADMIN_PASSWORD?.trim();

        console.log("Admin Check:", {
          inputEmail,
          adminEmail,
          inputPassword,
          adminPassword,
        });

        // Only allow if credentials match the admin credentials
        if (inputEmail === adminEmail && inputPassword === adminPassword) {
          console.log("✅ Admin authenticated");
          return {
            id: "admin",
            name: "Admin",
            email: inputEmail,
            role: "admin",
          };
        }

        console.log("❌ Admin credentials do not match");
        throw new Error("Invalid credentials");
      },
    }),
    // Public Credentials Provider
    CredentialsProvider({
      id: "public",
      name: "Public Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "your@email.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing credentials");
          throw new Error("Missing email or password");
        }

        const inputEmail = credentials.email.trim();
        const inputPassword = credentials.password.trim();

        // Lookup user in your database using Prisma
        const user = await prisma.user.findUnique({
          where: { email: inputEmail },
        });

        if (!user) {
          console.log("❌ User not found:", inputEmail);
          throw new Error("Invalid credentials");
        }

        const isValid = await bcrypt.compare(inputPassword, user.password);
        console.log("🔹 Password valid?", isValid);

        if (!isValid) {
          console.log("❌ Password mismatch for user:", inputEmail);
          throw new Error("Invalid credentials");
        }

        console.log("✅ User authenticated:", user.email);
        return {
          id: user.id.toString(),
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: "user",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: { id: string; role?: string } }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
