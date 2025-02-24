import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (user && bcrypt.compareSync(password, user.password)) {
        // Password matches
        res.status(200).json({ success: true });
      } else {
        // Invalid email or password
        res.status(401).json({ success: false });
      }
    } catch {
      res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}