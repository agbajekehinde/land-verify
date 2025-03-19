// pages/api/auth/reset-password.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from "@/lib/auth";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log("Received reset password request");
    const { token, password } = req.body;
    
    if (!token || !password) {
      console.log("Missing token or password");
      return res.status(400).json({ message: "Token and password are required" });
    }
    
    console.log("Looking up token for password reset:", token);
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });
    
    if (!verificationToken) {
      console.log("Token not found for password reset");
      return res.status(404).json({ message: "Invalid token" });
    }
    
    console.log("Token found:", verificationToken);
    
    if (new Date(verificationToken.expiresAt) < new Date()) {
      console.log("Token expired:", verificationToken.expiresAt);
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      });
      return res.status(400).json({ message: "Token has expired" });
    }
    
    console.log("Finding user with email:", verificationToken.email);
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.email },
    });
    
    if (!user) {
      console.log("User not found for email:", verificationToken.email);
      return res.status(404).json({ message: "User not found" });
    }
    
    // Update password
    console.log("Updating password for user:", user.id);
    const hashedPassword = await hashPassword(password);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
    
    // Delete the token
    console.log("Deleting used token");
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });
    
    console.log("Password reset successfully");
    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error in reset password:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}