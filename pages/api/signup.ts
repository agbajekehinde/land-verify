'use-server';

import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { firstName, lastName, email } = req.body;

    try {
      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
        },
      });

      res.status(200).json({ message: 'User created successfully', user });
    } catch (error) {
      const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
      res.status(500).json({ message: 'User already exists', error: errorMessage });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
