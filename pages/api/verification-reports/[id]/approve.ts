import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

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
    // return res.status(401).json({ message: 'Unauthorized' });
    // }
    
    const reportId = req.query.id as string;
    
    // Find the report and include the verification request and user information
    const report = await prisma.verificationReport.findUnique({
      where: { id: reportId },
      include: {
        verificationRequest: {
          include: {
            user: true
          }
        }
      }
    });
    
    if (!report) {
      return res.status(404).json({ message: 'Verification report not found' });
    }
    
    // Update the report status to APPROVED
    const updatedReport = await prisma.verificationReport.update({
      where: { id: reportId },
      data: {
        status: 'APPROVED',
        updatedAt: new Date()
      },
    });
    
    // Send email notification to the user
    const { user } = report.verificationRequest;
    const { address, city, state } = report.verificationRequest;
    
    if (user && user.email) {
      try {
        await resend.emails.send({
          from: `LandVerify <${process.env.EMAIL_FROM}>`,
          to: user.email,
          subject: 'Your Verification Report Is Ready',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
              <h2 style="color: #2e7d32;">Good news, ${user.firstName}!</h2>
              <p>Your verification report for the property at <strong>${address}, ${city}, ${state}</strong> has been completed and is now available for you to view.</p>
              <p>The verification has been completed successfully, and you can access all details through your account dashboard.</p>
              
              <div style="margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://landverify.ng'}/signin" 
                   style="background-color: #2e7d32; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                  View Your Report
                </a>
              </div>
              
              <p>If you have any questions about your verification report, please don't hesitate to contact our support team.</p>
              <p>Thank you for using our verification services!</p>
              
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eaeaea; color: #6B7280; font-size: 14px;">
                <p>This is an automated message, please do not reply to this email.</p>
                <p>&copy; ${new Date().getFullYear()} LandVerify. All rights reserved.</p>
              </div>
            </div>
          `,
        });
        
        console.log(`Email notification sent to ${user.email}`);
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
        // We'll continue even if email sending fails - the report is still approved
      }
    }
    
    return res.status(200).json({
      message: 'Report approved and released to user',
      report: updatedReport,
      emailSent: user?.email ? true : false
    });
    
  } catch (error) {
    console.error('Error approving report:', error);
    return res.status(500).json({ message: 'Failed to approve report' });
  }
}