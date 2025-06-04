export interface BlockchainFactors {
  gasFeeEstimate: string;
  networkCompatibility: string;
  contractSecurity: string;
}

export interface CampaignRecommendation {
  campaignId: number;
  score: number;
  matchingFactors: string[];
  relevanceScore: number;
  blockchainFactors: BlockchainFactors;
}

export interface RecommendationResponse {
  recommendations: CampaignRecommendation[];
  explanations: string[];
}
