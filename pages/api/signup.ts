'use-server';

import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { firstName, lastName, email, password } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
        },
      });

      res.status(200).json({ message: 'User created successfully', user });
    } catch (error) {
      console.error('Error creating user:', error);
      const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
      res.status(500).json({ message: 'An unexpected error occurred', error: errorMessage });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
