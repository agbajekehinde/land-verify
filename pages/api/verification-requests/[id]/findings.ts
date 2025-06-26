import type { NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { withApiKeyAuth, withRateLimit, AuthenticatedRequest } from '../../../../utils/auth';

const prisma = new PrismaClient();

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid verification request ID' });
  }

  try {
    const report = await prisma.verificationReport.findUnique({
      where: { verificationRequestId: id },
      select: {
        findings: true,
        status: true,
        updatedAt: true,
      },
    });

    if (!report) {
      return res.status(404).json({ message: 'Findings not found for this verification request' });
    }

    return res.status(200).json({
      findings: report.findings,
      status: report.status,
      updatedAt: report.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching findings:', error);
    return res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : String(error) });
  }
}

export default withRateLimit(30, 60000)(withApiKeyAuth(handler)); 