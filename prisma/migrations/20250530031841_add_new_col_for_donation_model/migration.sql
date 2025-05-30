-- AlterTable
ALTER TABLE "Donation" ADD COLUMN     "address" TEXT,
ADD COLUMN     "onChainDonatedId" INTEGER,
ADD COLUMN     "txHash" TEXT;
