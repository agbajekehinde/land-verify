import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { token } = req.query;

  if (!token || typeof token !== 'string') {
    return res.status(400).json({ success: false, message: 'Invalid token' });
  }

  try {
    const verificationRecord = await prisma.verificationToken.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date(), // Check if token hasn't expired
        },
      },
    });

    if (!verificationRecord) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired verification link. Please request a new one.' 
      });
    }

    // Check if the user already exists and is verified
    const existingUser = await prisma.user.findUnique({
      where: { email: verificationRecord.email },
    });

    if (existingUser && existingUser.emailVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'This email is already registered and verified. Please sign in instead.' 
      });
    }

    return res.status(200).json({
      success: true,
      email: verificationRecord.email,
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify token. Please try again later.',
    });
  }
}