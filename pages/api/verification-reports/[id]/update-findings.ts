// pages/api/verification-reports/[id]/update-findings.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow PATCH requests
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const reportId = req.query.id as string;
    const data = req.body;

    // Validate input data
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ message: 'Invalid request body' });
    }

    const { findings, status } = data;

    // Find the report to make sure it exists
    const existingReport = await prisma.verificationReport.findUnique({
      where: { id: reportId },
    });

    if (!existingReport) {
      return res.status(404).json({ message: 'Verification report not found' });
    }

    // Update only the findings and status of the report
    const updatedReport = await prisma.verificationReport.update({
      where: { id: reportId },
      data: {
        status: status || existingReport.status,
        findings: findings || existingReport.findings,
        updatedAt: new Date()
      },
    });

    return res.status(200).json({
      message: 'Verification findings updated successfully',
      report: updatedReport
    });
  } catch (error) {
    console.error('Error updating verification findings:', error);
    return res.status(500).json({ message: 'Failed to update verification findings' });
  }
}