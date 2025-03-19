import { randomBytes } from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function generatePasswordResetToken(email: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now
  
  // Delete any existing token for this email
  await prisma.verificationToken.deleteMany({
    where: { email },
  });
  
  // Create a new token
  const verificationToken = await prisma.verificationToken.create({
    data: {
      email,
      token,
      expiresAt,
    },
  });
  
  return { token, expiresAt };
}
