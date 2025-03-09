import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const id = req.query.id as string;
    const { status } = req.body;
    
    if (!id || !status) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    // Update verification request status
    const updatedVerification = await prisma.verificationRequest.update({
      where: { id },
      data: { status }
    });

    return res.status(200).json(updatedVerification);
  } catch (error) {
    console.error("Error updating verification status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}