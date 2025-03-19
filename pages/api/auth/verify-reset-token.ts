import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { token } = req.query;
    
    if (!token || Array.isArray(token)) {
      return res.status(400).json({ message: "Invalid token" });
    }
    
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });
    
    if (!verificationToken) {
      return res.status(404).json({ message: "Invalid token" });
    }
    
    if (new Date(verificationToken.expiresAt) < new Date()) {
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      });
      return res.status(400).json({ message: "Token has expired" });
    }
    
    return res.status(200).json({ message: "Token is valid" });
  } catch (error) {
    console.error("Error in verify reset token:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}