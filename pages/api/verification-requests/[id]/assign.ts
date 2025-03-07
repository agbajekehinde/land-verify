import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { partnerId } = req.body;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID parameter' });
  }

  if (!partnerId) {
    return res.status(400).json({ error: "Partner ID is required" });
  }

  try {
    // Update the verification request with the partner ID and change status to IN_PROGRESS
    const updatedVerification = await prisma.verificationRequest.update({
      where: { id },
      data: {
        partnerId: partnerId,
        status: "IN_PROGRESS", // Update status from PENDING to IN_PROGRESS
      },
    });

    return res.status(200).json(updatedVerification);
  } catch (error) {
    console.error("Error assigning partner:", error);
    return res.status(500).json({ error: "Failed to assign partner" });
  } finally {
    await prisma.$disconnect();
  }
}