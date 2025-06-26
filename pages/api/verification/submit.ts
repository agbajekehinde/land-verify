import type { NextApiResponse } from 'next';
import { withApiKeyAuth, withRateLimit, AuthenticatedRequest } from '../../../utils/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Parse and validate payload - only address and files are required
    const { address, files, lga, state, landsize, latitude, longitude, userId } = req.body;

    if (!address || !Array.isArray(files) || files.length === 0 || !userId) {
      return res.status(400).json({ message: 'Missing required fields: address, files, and userId' });
    }

    // Create verification request in DB
    const verificationRequest = await prisma.verificationRequest.create({
      data: {
        userId: userId,
        address,
        files,
        lga: lga || 'Unknown',
        state: state || 'Unknown',
        landsize: landsize || 'Unknown',
        latitude: latitude || undefined,
        longitude: longitude || undefined,
      }
    });

    // Auto-assign a partner (first available)
    const partner = await prisma.partner.findFirst({});
    let partnerId = null;
    if (partner) {
      await prisma.verificationRequest.update({
        where: { id: verificationRequest.id },
        data: { partnerId: partner.id }
      });
      partnerId = partner.id;
    }

    // Log into verificationReport table with findings: {} and status: 'SUBMITTED'
    await prisma.verificationReport.create({
      data: {
        verificationRequestId: verificationRequest.id,
        partnerId: partnerId,
        reportFiles: [],
        findings: {},
        status: 'SUBMITTED',
      }
    });

    // Return response
    return res.status(200).json({
      status: 'SUBMITTED',
      findings: null,
      verificationId: verificationRequest.id,
      partnerId
    });
  } catch (error) {
    console.error('Error in verification/submit:', error);
    return res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : String(error) });
  }
}

export default withRateLimit(30, 60000)(withApiKeyAuth(handler));
