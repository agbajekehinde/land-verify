import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]"; // Ensure correct import path
import { PrismaClient } from "@prisma/client";

// Initialize Prisma
const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // ✅ Authenticate user
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user || !session.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = parseInt(session.user.id as string, 10);

    // ✅ Fetch verifications for the logged-in user
    const verifications = await prisma.verificationRequest.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(verifications);
  } catch (error) {
    console.error("Error fetching verification history:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
