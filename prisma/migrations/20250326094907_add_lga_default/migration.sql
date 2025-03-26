/*
  Warnings:

  - You are about to drop the column `city` on the `VerificationRequest` table. All the data in the column will be lost.
  - You are about to drop the column `postalCode` on the `VerificationRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT CAST(FLOOR(RANDOM() * 9000 + 1000) AS INT);

-- AlterTable
ALTER TABLE "VerificationRequest" DROP COLUMN "city",
DROP COLUMN "postalCode",
ADD COLUMN     "lga" TEXT NOT NULL DEFAULT 'Unknown';
