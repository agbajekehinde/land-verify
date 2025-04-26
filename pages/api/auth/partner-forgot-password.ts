import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import crypto from 'crypto';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

// Function to generate a random token
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find the partner with the provided email
    const partner = await prisma.partner.findUnique({
      where: { email },
    });

    if (!partner) {
      // For security reasons, don't reveal if the email exists or not
      return res.status(200).json({ message: 'If your email exists in our system, you will receive a password reset link' });
    }

    // Generate a token with 1-hour expiration
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

    // Store the token in the database
    await prisma.verificationToken.upsert({
      where: { email },
      update: {
        token,
        expiresAt,
      },
      create: {
        email,
        token,
        expiresAt,
      },
    });

    // Create the reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/partner/reset-password/${token}`;

    // Send the email with the reset link
    await resend.emails.send({
      from: 'support@landverify.ng',
      to: email,
      subject: 'Reset Your LandVerify Partner Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${process.env.NEXT_PUBLIC_BASE_URL}/Landverify-partner.svg" alt="LandVerify Logo" style="height: 60px;">
          </div>
          <h1 style="color: #479101; text-align: center;">Password Reset Request</h1>
          <p>Hello ${partner.firstName},</p>
          <p>We received a request to reset your password for your LandVerify Partner account. Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #479101; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
          </div>
          <p>This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
          <p>Thanks,<br>The LandVerify Team</p>
        </div>
      `,
    });

    return res.status(200).json({ message: 'Password reset link sent' });
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({ message: 'Failed to send reset link' });
  }
}