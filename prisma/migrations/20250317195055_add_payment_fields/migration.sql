-- AlterTable
ALTER TABLE "VerificationRequest" ADD COLUMN     "paymentAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "paymentType" TEXT NOT NULL DEFAULT 'regular';
