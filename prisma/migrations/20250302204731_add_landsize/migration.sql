-- AlterTable
ALTER TABLE "VerificationRequest" ADD COLUMN     "landsize" TEXT NOT NULL DEFAULT 'Unknown',
ALTER COLUMN "latitude" DROP NOT NULL,
ALTER COLUMN "longitude" DROP NOT NULL;
