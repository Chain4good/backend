-- CreateTable
CREATE TABLE "CampaignVerificationRequest" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "reason" TEXT,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "adminId" INTEGER NOT NULL,
    "campaignId" INTEGER NOT NULL,

    CONSTRAINT "CampaignVerificationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignEvidenceResponse" (
    "id" SERIAL NOT NULL,
    "description" TEXT,
    "documents" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verificationRequestId" INTEGER NOT NULL,

    CONSTRAINT "CampaignEvidenceResponse_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CampaignVerificationRequest" ADD CONSTRAINT "CampaignVerificationRequest_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignVerificationRequest" ADD CONSTRAINT "CampaignVerificationRequest_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignEvidenceResponse" ADD CONSTRAINT "CampaignEvidenceResponse_verificationRequestId_fkey" FOREIGN KEY ("verificationRequestId") REFERENCES "CampaignVerificationRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
