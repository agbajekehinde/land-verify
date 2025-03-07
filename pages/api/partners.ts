import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const partners = await prisma.partner.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    return res.status(200).json(partners);
  } catch (error) {
    console.error("Error fetching partners:", error);
    return res.status(500).json({ error: "Failed to fetch partners" });
  } finally {
    await prisma.$disconnect();
  }
}