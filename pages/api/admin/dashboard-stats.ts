// pages/api/admin/dashboard-stats.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

type DashboardStats = {
  totalRequests: number;
  totalPending: number;
  totalCompleted: number;
  totalReports: number;
  totalUsers: number;
  totalPartners: number;
};

type ErrorResponse = {
  error: string;
};

// Initialize Prisma client with singleton pattern to prevent connection issues
const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DashboardStats | ErrorResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the session server-side using unstable_getServerSession
    // This is more reliable than getSession for API routes
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get all stats in parallel for efficiency
    const [
      totalRequests,
      totalPending,
      totalCompleted,
      totalReports,
      totalUsers,
      totalPartners
    ] = await Promise.all([
      // Total verification requests
      prisma.verificationRequest.count(),
      
      // Pending verification requests
      prisma.verificationRequest.count({
        where: { status: 'PENDING' }
      }),
      
      // Completed verification requests
      prisma.verificationRequest.count({
        where: { status: 'COMPLETED' }
      }),
      
      // Total verification reports
      prisma.verificationReport.count(),
      
      // Total users
      prisma.user.count({
        where: { role: 'user' }
      }),
      
      // Total partners
      prisma.partner.count()
    ]);

    // Return the stats
    return res.status(200).json({
      totalRequests,
      totalPending,
      totalCompleted,
      totalReports,
      totalUsers,
      totalPartners
    });
    
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
}