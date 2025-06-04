export interface TrustAnalysis {
  trustScore: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  credibilityFactors: string[];
  riskFactors: string[];
  recommendations: string[];
}
