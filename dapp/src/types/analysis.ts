export interface AnalysisResult {
  volatility: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  meanReturn: number;
  dataPoints: number;
  monthlyVolatility: { date: string; volatility: number }[];
  proofId: string;
  isVerified: boolean;
  timestamp: Date;
}

export interface ParsedCSVData {
  dates: string[];
  returns: number[];
  weights?: number[];
}
