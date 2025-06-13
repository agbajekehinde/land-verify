import { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { recipientEmail, recipientName, verificationId, address, paymentType } = req.body;

  // Enhanced validation
  if (!recipientEmail || !verificationId) {
    return res.status(400).json({ message: 'Email and verification ID are required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(recipientEmail)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  // Check for required environment variables
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured');
    return res.status(500).json({ message: 'Email service not configured' });
  }

  if (!process.env.EMAIL_FROM) {
    console.error('EMAIL_FROM is not configured');
    return res.status(500).json({ message: 'Email sender not configured' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  // Service type details
  const serviceDetails = paymentType === 'priority'
    ? 'Priority Service (48 hours)'
    : 'Regular Service (5-7 working days)';

  try {
    console.log('Attempting to send email to:', recipientEmail);
    console.log('Verification ID:', verificationId);

    const data = await resend.emails.send({
      from: 'LandVerify <support@landverify.ng>',
      to: [recipientEmail, "support@landverify.ng"],
      subject: '📄 Your Verification Request Has Been Submitted',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <img src="https://cloud1.email2go.io/c719661049fdb28eb938384500b8ad60/e9cce5ec81bc0cb4e4abf456a251ead73a741e6270b1cb63a2c29d2a77cffe73.png"; style="width: 160px;">
          <h2 style="color: #2e7d32;">Verification Request Submitted</h2>
          <p>Dear ${recipientName || 'Customer'},</p>
          <p>Thank you for submitting your land verification request. We have received your request and payment successfully.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Request Details:</h3>
          <p><strong>Verification ID:</strong> ${verificationId}</p>
          <p><strong>Property Address:</strong> ${address || 'Not specified'}</p>
          <p><strong>Service Type:</strong> ${serviceDetails}</p>
          </div>
          <p>Our team will begin processing your verification request shortly. You can track the status of your request by logging into your account.</p>
          <p>If you have any questions or need further assistance, please contact our support team.</p>
          <p>Best regards,<br>The Land Verification Team</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
          <p>This is an automated message. Please do not reply directly to this email.</p>
          </div>
          </div>
      `,
    });

    console.log('Email sent successfully:', data);
    return res.status(200).json({ message: 'Email sent successfully', data });

  } catch (error) {
    console.error('Error sending email:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return res.status(500).json({ 
      message: 'Failed to send email', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}