// pages/api/auth/verify-reset-token.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log("Received token verification request:", req.query);
    const { token } = req.query;
    
    if (!token || Array.isArray(token)) {
      console.log("Invalid token format:", token);
      return res.status(400).json({ message: "Invalid token" });
    }
    
    console.log("Looking up token:", token);
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });
    
    if (!verificationToken) {
      console.log("Token not found in database");
      return res.status(404).json({ message: "Invalid token" });
    }
    
    console.log("Token found:", verificationToken);
    
    if (new Date(verificationToken.expiresAt) < new Date()) {
      console.log("Token expired:", verificationToken.expiresAt);
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      });
      return res.status(400).json({ message: "Token has expired" });
    }
    
    console.log("Token is valid");
    return res.status(200).json({ message: "Token is valid" });
  } catch (error) {
    console.error("Error in verify reset token:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}