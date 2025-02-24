import NextAuth, { AuthOptions, SessionStrategy } from "next-auth"; // Import SessionStrategy
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
    } & DefaultSession["user"];
  }
}

const prisma = new PrismaClient();

export const authOptions: AuthOptions = {  // Explicitly type authOptions
  session: { strategy: "jwt" as SessionStrategy }, // Fix type error
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "your@email.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing credentials");
          throw new Error("Missing email or password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          console.log("❌ User not found:", credentials.email);
          throw new Error("Invalid credentials");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        console.log("🔹 Password valid?", isValid); // Add this log to debug
        
        if (!isValid) {
          console.log("❌ Password mismatch for user:", credentials.email);
          throw new Error("Invalid credentials");
        }
        console.log("✅ User authenticated:", user.email);
        return { id: user.id.toString(), name: `${user.firstName} ${user.lastName}`, email: user.email };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: { id: string } }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
