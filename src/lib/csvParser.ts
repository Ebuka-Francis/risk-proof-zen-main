export interface ParsedData {
  dates: string[];
  returns: number[];
  weights?: number[];
}

export interface AnalysisResult {
  volatility: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  meanReturn: number;
  dataPoints: number;
  monthlyVolatility: { date: string; volatility: number }[];
}

export const parseCSV = (content: string): ParsedData => {
  const lines = content.trim().split("\n");
  if (lines.length < 2) {
    throw new Error("CSV must have at least a header and one data row");
  }

  const header = lines[0].toLowerCase().split(",").map((h) => h.trim());
  const dateIndex = header.findIndex((h) => h.includes("date"));
  const returnIndex = header.findIndex(
    (h) => h.includes("return") || h.includes("pct") || h.includes("value")
  );
  const weightIndex = header.findIndex((h) => h.includes("weight"));

  if (returnIndex === -1) {
    throw new Error(
      "CSV must contain a return column (e.g., return_pct, returns, value)"
    );
  }

  const dates: string[] = [];
  const returns: number[] = [];
  const weights: number[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    if (values.length <= returnIndex) continue;

    const returnValue = parseFloat(values[returnIndex]);
    if (isNaN(returnValue)) continue;

    returns.push(returnValue);

    if (dateIndex !== -1 && values[dateIndex]) {
      dates.push(values[dateIndex]);
    } else {
      dates.push(`Day ${i}`);
    }

    if (weightIndex !== -1 && values[weightIndex]) {
      const weightValue = parseFloat(values[weightIndex]);
      if (!isNaN(weightValue)) {
        weights.push(weightValue);
      }
    }
  }

  if (returns.length === 0) {
    throw new Error("No valid return data found in CSV");
  }

  return {
    dates,
    returns,
    weights: weights.length > 0 ? weights : undefined,
  };
};

export const calculateVolatility = (returns: number[]): number => {
  if (returns.length < 2) return 0;

  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const squaredDiffs = returns.map((r) => Math.pow(r - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / (returns.length - 1);
  const stdDev = Math.sqrt(variance);

  // Annualize (assuming daily returns, ~252 trading days)
  const annualizedVolatility = stdDev * Math.sqrt(252);

  return Math.round(annualizedVolatility * 100) / 100;
};

export const calculateMeanReturn = (returns: number[]): number => {
  if (returns.length === 0) return 0;
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  return Math.round(mean * 100) / 100;
};

export const determineRiskLevel = (
  volatility: number,
  customThreshold?: number
): "LOW" | "MEDIUM" | "HIGH" => {
  if (customThreshold !== undefined) {
    return volatility <= customThreshold ? "LOW" : "HIGH";
  }

  if (volatility < 5) return "LOW";
  if (volatility < 15) return "MEDIUM";
  return "HIGH";
};

export const generateMonthlyVolatility = (
  dates: string[],
  returns: number[]
): { date: string; volatility: number }[] => {
  // Group returns by month and calculate rolling volatility
  const monthlyData: { date: string; volatility: number }[] = [];
  const windowSize = Math.min(20, Math.floor(returns.length / 6)); // Rolling window

  if (returns.length < windowSize) {
    // Not enough data for rolling, return single point
    return [{ date: "Current", volatility: calculateVolatility(returns) }];
  }

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const step = Math.floor(returns.length / 12);
  for (let i = 0; i < 12; i++) {
    const startIdx = i * step;
    const endIdx = Math.min(startIdx + windowSize, returns.length);
    if (startIdx >= returns.length) break;

    const windowReturns = returns.slice(startIdx, endIdx);
    const vol = calculateVolatility(windowReturns);

    monthlyData.push({
      date: months[i % 12],
      volatility: Math.round(vol * 10) / 10,
    });
  }

  return monthlyData.length > 0 ? monthlyData : [{ date: "Current", volatility: calculateVolatility(returns) }];
};

export const analyzeData = (
  parsedData: ParsedData,
  customThreshold?: number
): AnalysisResult => {
  const volatility = calculateVolatility(parsedData.returns);
  const riskLevel = determineRiskLevel(volatility, customThreshold);
  const meanReturn = calculateMeanReturn(parsedData.returns);
  const monthlyVolatility = generateMonthlyVolatility(
    parsedData.dates,
    parsedData.returns
  );

  return {
    volatility,
    riskLevel,
    meanReturn,
    dataPoints: parsedData.returns.length,
    monthlyVolatility,
  };
};

export const generateProofId = (): string => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "aleo1";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  result += "...";
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
