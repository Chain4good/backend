/*
  Warnings:

  - You are about to drop the column `fundraisTypeId` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the `FundraisType` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_fundraisTypeId_fkey";

-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "fundraisTypeId",
ADD COLUMN     "fundraiseTypeId" INTEGER;

-- DropTable
DROP TABLE "FundraisType";

-- CreateTable
CREATE TABLE "FundraiseType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "FundraiseType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FundraiseType_name_key" ON "FundraiseType"("name");

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_fundraiseTypeId_fkey" FOREIGN KEY ("fundraiseTypeId") REFERENCES "FundraiseType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
