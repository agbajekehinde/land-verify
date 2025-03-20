import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from "@prisma/client";
import { generatePasswordResetToken } from '@/lib/tokens';
import { sendPasswordResetEmail } from '@/lib/reset-password';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      // Don't reveal if the user exists or not
      return res.status(200).json({ message: "If your email is registered, you will receive a password reset link" });
    }
    
    // Generate a token and save it
    const { token } = await generatePasswordResetToken(email);
    
    // Send email
    await sendPasswordResetEmail(
      email,
      token
    );
    
    return res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Error in forgot password:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}