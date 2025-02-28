"use-server";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]"; // Ensure this path is correct
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // ✅ Parse FormData
    const formData = await req.formData();

    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const postalCode = formData.get("postalCode") as string;
    const latitude = parseFloat(formData.get("latitude") as string);
    const longitude = parseFloat(formData.get("longitude") as string);
    const files = formData.getAll("files"); // Gets all uploaded files

    // ✅ Validation
    if (!address || !city || !state || !postalCode || (latitude) || (longitude)) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // 🚀 Handle file uploads (optional)
    const fileUrls: string[] = [];
    for (const file of files) {
      if (file instanceof File) {
        // You can process file storage here (e.g., upload to S3, Cloudinary)
        // For now, just store filenames
        fileUrls.push(file.name);
      }
    }

    // ✅ Create verification request in Prisma
    const newVerification = await prisma.verificationRequest.create({
      data: {
        userId: parseInt(session.user.id), // Ensure correct type
        address,
        city,
        state,
        postalCode,
        latitude,
        longitude,
        files: fileUrls, // Save filenames instead of raw files
      },
    });

    return NextResponse.json(
      { message: "Verification request submitted", verification: newVerification },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error submitting verification:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
