import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check if it's a GET request
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Verify server-side session
    const session = await getServerSession(req, res, authOptions);

    // Check if user is authenticated and is an admin
    if (!session || session.user?.role !== 'admin') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Initialize Prisma client
    const prisma = new PrismaClient();

    // Fetch customers
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Close Prisma connection
    await prisma.$disconnect();

    // Return users data
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return res.status(500).json({ 
      message: 'Internal Server Error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}