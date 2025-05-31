/*
  Warnings:

  - You are about to alter the column `totalDonated` on the `Campaign` table. The data in that column could be lost. The data in that column will be cast from `Decimal(18,2)` to `Decimal(18,8)`.

*/
-- AlterTable
ALTER TABLE "Campaign" ALTER COLUMN "totalDonated" SET DATA TYPE DECIMAL(18,8);
