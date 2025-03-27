import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import crypto from 'crypto';
import { rateLimit } from '@/app/utils/rate-limit';
import { isDisposableEmail } from '@/app/utils/email-validator';

const globalForPrisma = global as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Configure rate limiting - 3 requests per IP per minute
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max 500 users per interval
  limit: 3, // 3 requests per interval
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Apply rate limiting based on IP
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    await limiter.check(res, clientIp as string, 3);
  } catch {
    return res.status(429).json({ success: false, message: 'Too many requests. Please try again later.' });
  }

  const { email } = req.body;

  // Basic validation
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ success: false, message: 'Valid email is required' });
  }

  try {
    // Check if email is from a disposable domain
    if (await isDisposableEmail(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please use a valid, non-disposable email address' 
      });
    }

    // Check if email already exists and is verified - don't give specifics to prevent enumeration
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.emailVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email sent. Please check your inbox to complete your registration' 
      });
    }

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    // Store the verification token in the database
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

    // Generate the verification URL
    const baseUrl = process.env.NEXTAUTH_URL;
    const verificationUrl = `${baseUrl}/complete-signup?token=${token}`;

    // Send the verification email using Resend
    try {
      const data = await resend.emails.send({
        from: 'LandVerify <support@landverify.ng>',
        to: email,
        subject: '✉️ Verify your email address',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Verify your email address</h1>
            <p>Click the button below to verify your email and complete your registration with LandVerify.</p>
            <div style="margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #479101; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Complete Your Registration</a>
            </div>
            <p style="color: #666; font-size: 14px;">This link will expire in 15 minutes for security reasons.</p>
            <p style="color: #666; font-size: 14px;">If you didn't request this email, you can safely ignore it.</p>
          </div>
        `,
      });
      return res.status(200).json({ success: true, message: 'Verification email sent', data });
    } catch (error) {   
      console.error('Error sending verification email:', error);
      return res.status(500).json({ success: false, message: 'Failed to send verification email' });
    }  
  } catch (error) {
    console.error('Error in verification process:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}