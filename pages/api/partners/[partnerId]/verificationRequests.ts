import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const partnerId = parseInt(req.query.partnerId as string);
    
    if (isNaN(partnerId)) {
      return res.status(400).json({ message: "Invalid partner ID" });
    }

    const verificationRequests = await prisma.verificationRequest.findMany({
      where: {
        partnerId: partnerId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(verificationRequests);
  } catch (error) {
    console.error("Error fetching partner verification requests:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}