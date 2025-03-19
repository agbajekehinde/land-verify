import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(
  email: string,
  token: string
) {
  // Generate the verification URL
  const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;
  
  const result = await resend.emails.send({
    from: `LandVerify <${process.env.EMAIL_FROM || 'support@landverify.ng'}>`,
    to: email,
    subject: "Reset your LandVerify password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <img src="${baseUrl}/LandVerify-logo.png" alt="LandVerify Logo" style="max-width: 200px; margin: 20px 0;">
        <h2>Reset Your Password</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password for your LandVerify account.</p>
        <p>Please click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #479101; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
        </div>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this reset, please ignore this email.</p>
        <p>Regards,<br>The LandVerify Team</p>
      </div>
    `,
  });
  
  return result;
}