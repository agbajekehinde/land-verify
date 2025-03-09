import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

// Initialize Prisma client
const globalForPrisma = global as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Basic validation and error handling
  try {
    // Log the body for debugging
    console.log("Request body:", req.body);
    
    // Ensure the request body exists
    if (!req.body) {
      return res.status(400).json({ message: "Request body is empty" });
    }

    // Extract parameters from body
    const { verificationRequestId, partnerId, reportFiles, findings, status } = req.body;
    
    // Log received parameters for debugging
    console.log("Received parameters:", { verificationRequestId, partnerId, reportFiles, findings, status });

    // Validate required parameters
    if (!verificationRequestId || !partnerId) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    // Check if verification request exists
    const verificationRequest = await prisma.verificationRequest.findUnique({
      where: { id: verificationRequestId },
    });

    if (!verificationRequest) {
      return res.status(404).json({ message: "Verification request not found" });
    }

    // Check if a report already exists for this verification request
    const existingReport = await prisma.verificationReport.findUnique({
      where: { verificationRequestId },
    });

    if (existingReport) {
      // Update existing report instead of creating a new one
      const updatedReport = await prisma.verificationReport.update({
        where: { verificationRequestId },
        data: {
          partnerId: Number(partnerId),
          reportFiles: Array.isArray(reportFiles) ? reportFiles : [],
          findings: findings, // Already an object
          status: status || "DRAFT",
        },
      });
      return res.status(200).json(updatedReport);
    }

    // Handle findings - ensure it's a proper object for Prisma
    console.log("Findings type:", typeof findings, findings);
    
    // Create verification report - be explicit about the data structure
    const reportData = {
      verificationRequestId,
      partnerId: Number(partnerId),
      reportFiles: Array.isArray(reportFiles) ? reportFiles : [],
      findings: findings, // Already validated as an object
      status: status || "DRAFT",
    };
    
    console.log("Report data for Prisma:", reportData);
    
    const report = await prisma.verificationReport.create({
      data: reportData
    });

    // Return success response
    return res.status(201).json(report);
  } catch (error) {
    console.error("Error creating verification report:", error);
    return res.status(500).json({
      message: "Failed to create verification report",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}