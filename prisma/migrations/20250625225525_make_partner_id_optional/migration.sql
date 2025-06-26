-- DropForeignKey
ALTER TABLE "VerificationReport" DROP CONSTRAINT "VerificationReport_partnerId_fkey";

-- AlterTable
ALTER TABLE "VerificationReport" ALTER COLUMN "partnerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "VerificationReport" ADD CONSTRAINT "VerificationReport_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
