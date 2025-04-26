import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'Token is required' });
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

    // Token is valid
    return res.status(200).json({ valid: true });
  } catch (error) {
    console.error('Token validation error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}