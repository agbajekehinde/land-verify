import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow PATCH method
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check if the user is authenticated and is an admin (you would implement this)
    // const session = await getSession({ req }); // implement your auth logic
    // if (!session || session.user.role !== 'ADMIN') {
    //   return res.status(401).json({ message: 'Unauthorized' });
    // }

    const reportId = req.query.id as string;

    // Find the report
    const report = await prisma.verificationReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return res.status(404).json({ message: 'Verification report not found' });
    }

    // Update the report status to REJECTED
    const updatedReport = await prisma.verificationReport.update({
      where: { id: reportId },
      data: { 
        status: 'REJECTED',
        updatedAt: new Date()
      },
    });

    // You could also implement notification logic here to inform the partner
    // that their report has been rejected and needs revision

    return res.status(200).json({ 
      message: 'Report has been rejected', 
      report: updatedReport 
    });
  } catch (error) {
    console.error('Error rejecting report:', error);
    return res.status(500).json({ message: 'Failed to reject report' });
  }
}