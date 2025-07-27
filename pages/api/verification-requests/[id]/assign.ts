import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from "@prisma/client";
import { Resend } from 'resend';

const globalForPrisma = global as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

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
    // Get verification request details for the email
    const verificationRequest = await prisma.verificationRequest.findUnique({
      where: { id },
    });
    
    if (!verificationRequest) {
      return res.status(404).json({ error: "Verification request not found" });
    }
    
    // Get partner details for the email
    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
    });
    
    if (!partner) {
      return res.status(404).json({ error: "Partner not found" });
    }
    
    // Update the verification request with the partner ID and change status to IN_PROGRESS
    const updatedVerification = await prisma.verificationRequest.update({
      where: { id },
      data: {
        partnerId: partnerId,
        status: "IN_PROGRESS", // Update status from PENDING to IN_PROGRESS
      },
    });
    
    // Send email notification to the partner using Resend
   try {
    await resend.emails.send({
      from: `LandVerify <${process.env.EMAIL_FROM}>`,
      to: partner.email,
      subject: 'New Verification Assignment',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
         <img src="https://cloud1.email2go.io/c719661049fdb28eb938384500b8ad60/e9cce5ec81bc0cb4e4abf456a251ead73a741e6270b1cb63a2c29d2a77cffe73.png"; style="width: 160px;">
          <h2 style="color: #2e7d32;">New Verification Assignment</h2>
          <p>Hello ${partner.firstName} ${partner.lastName},</p>
          <p>You have been assigned a new verification request. Please log in to the portal to view and process this request.</p>
          <p><strong>Verification Details:</strong></p>
          <ul>
            <li><strong>Address:</strong> ${verificationRequest.address}</li>
            <li><strong>LGA:</strong> ${verificationRequest.lga}</li>
            <li><strong>State:</strong> ${verificationRequest.state}</li>
            <li><strong>Plots:</strong> ${verificationRequest.landsize}</li>
            <li><strong>Verification Type:</strong> ${verificationRequest.paymentType}</li>
          </ul>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://landverify.ng'}/partner/signin" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 10px;">View Assignment</a></p>
          <p>Thank you,<br>LandVerify Team</p>
        </div>
      `,
    });
    
    return res.status(200).json(updatedVerification);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to send email notification' });
  }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to assign verification request' });
  }
}