import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID parameter' });
  }

  try {
    const verificationRequest = await prisma.verificationRequest.findUnique({
      where: { id },
      select: {
        id: true,
        address: true,
        city: true,
        state: true,
        postalCode: true,
        status: true,
      },
    });

    if (!verificationRequest) {
      return res.status(404).json({ error: "Verification request not found" });
    }

    return res.status(200).json(verificationRequest);
  } catch (error) {
    console.error("Error fetching verification request:", error);
    return res.status(500).json({ error: "Failed to fetch verification request" });
  } finally {
    await prisma.$disconnect();
  }
}