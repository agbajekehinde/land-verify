import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const globalForPrisma = global as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { token, firstName, lastName, password } = req.body;

  // Basic validation
  if (!token || !firstName || !password) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    // Begin a transaction
    return await prisma.$transaction(async (tx) => {
      // Find the verification token
      const verificationRecord = await tx.verificationToken.findFirst({
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

      const email = verificationRecord.email;

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Check if user already exists
      const existingUser = await tx.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        // Update existing user if not verified
        if (existingUser.emailVerified) {
          return res.status(400).json({ 
            success: false, 
            message: 'This email is already registered and verified. Please sign in instead.' 
          });
        }

        await tx.user.update({
          where: { email },
          data: {
            firstName,
            lastName,
            password: hashedPassword,
            emailVerified: true,
            verifiedAt: new Date(),
          },
        });
      } else {
        // Create new user
        await tx.user.create({
          data: {
            email,
            firstName,
            lastName,
            password: hashedPassword,
            emailVerified: true,
            verifiedAt: new Date(),
          },
        });
      }

      // Delete the verification token to prevent reuse
      await tx.verificationToken.delete({
        where: { id: verificationRecord.id },
      });

      return res.status(201).json({
        success: true,
        message: 'Account created successfully! You can now sign in.',
      });
    });
  } catch (error) {
    console.error('Complete signup error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again later.',
    });
  }
}