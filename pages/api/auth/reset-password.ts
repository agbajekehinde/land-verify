import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from "@/lib/auth";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" });
    }
    
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });
    
    if (!verificationToken) {
      return res.status(404).json({ message: "Invalid token" });
    }
    
    if (new Date(verificationToken.expiresAt) < new Date()) {
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      });
      return res.status(400).json({ message: "Token has expired" });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.email },
    });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Update password
    const hashedPassword = await hashPassword(password);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
    
    // Delete the token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });
    
    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error in reset password:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}