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

    // Fetch verification requests
    const requests = await prisma.verificationRequest.findMany({
      select: {
        id: true,
        address: true,
        lga: true,
        state: true,
        status: true,
        landsize: true,
        latitude: true,
        longitude: true,
        paymentStatus: true,
        paymentType: true,
        paymentAmount: true,
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        id: 'desc' // Optional: order by most recent first
      }
    });

    // Close Prisma connection
    await prisma.$disconnect();

    // Return requests data
    return res.status(200).json(requests);

  } catch (error) {
    console.error('Error fetching verification requests:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
}