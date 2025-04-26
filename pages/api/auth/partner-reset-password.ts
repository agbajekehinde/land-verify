import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

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

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'Token is required' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Valid password is required (minimum 6 characters)' });
    }

    // Find the verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    // Check if token exists and is not expired
    if (!verificationToken) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    if (verificationToken.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Token has expired' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the partner's password
    await prisma.partner.update({
      where: { email: verificationToken.email },
      data: { password: hashedPassword },
    });

    // Delete the used token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });

    return res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({ message: 'Failed to reset password' });
  }
}