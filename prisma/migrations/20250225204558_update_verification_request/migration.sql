/*
  Warnings:

  - You are about to drop the column `name` on the `VerificationRequest` table. All the data in the column will be lost.
  - Added the required column `city` to the `VerificationRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latitude` to the `VerificationRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `VerificationRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postalCode` to the `VerificationRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `VerificationRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VerificationRequest" DROP COLUMN "name",
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "longitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "postalCode" TEXT NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL;
