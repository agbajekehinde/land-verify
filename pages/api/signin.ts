import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    try {
      const user = await prisma.user.findUnique({ where: { email } });

      if (user && bcrypt.compareSync(password, user.password)) {
        // Authentication successful
        res.status(200).json({ success: true });
      } else {
        // Authentication failed
        res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}