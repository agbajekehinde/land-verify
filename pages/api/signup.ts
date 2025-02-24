'use-server';

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const globalForPrisma = global as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { firstName, lastName, email, password } = req.body;

    try {
      // Check if the email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
        },
      });

      // Avoid exposing sensitive data in responses
      return res.status(201).json({ success: true, message: 'Account created successfully' });
    } catch (error) {
      console.error('Signup Error:', error); // Log error without exposing details
      return res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
