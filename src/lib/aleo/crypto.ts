// Aleo Cryptographic Utilities
// Based on Aleo documentation for private input handling

/**
 * Generate a Poseidon hash commitment for portfolio data
 * This keeps raw portfolio data private while creating a verifiable commitment
 */
export function generatePortfolioCommitment(
  returns: number[],
  weights?: number[],
  salt?: string
): string {
  // Create deterministic input from portfolio data
  const dataString = JSON.stringify({
    returns: returns.map((r) => Math.round(r * 1e6)), // Scale to integers
    weights: weights?.map((w) => Math.round(w * 1e6)) || [],
    salt: salt || generateSalt(),
  });

  // Generate hash using Web Crypto API (simulating Poseidon hash)
  return hashToField(dataString);
}

/**
 * Generate cryptographic salt for commitment
 */
export function generateSalt(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Hash data to Aleo field element format
 * Simulates Poseidon2 hash used in Leo programs
 */
export function hashToField(data: string): string {
  // Use SHA-256 and convert to field-compatible format
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  
  // Simple hash simulation - in production, use actual Aleo SDK
  let hash = 0n;
  for (let i = 0; i < dataBuffer.length; i++) {
    hash = (hash * 31n + BigInt(dataBuffer[i])) % (2n ** 253n - 1n);
  }
  
  return `${hash}field`;
}

/**
 * Generate volatility parameters for Leo program
 * Converts floating point to fixed-point integers for ZK computation
 */
export function encodeVolatilityParams(
  returns: number[],
  annualize: boolean = true
): {
  scaled_returns: string[];
  trading_days: string;
  annualize_flag: string;
} {
  const SCALE = 1e6; // 6 decimal precision
  const TRADING_DAYS = 252;

  return {
    scaled_returns: returns.map((r) => `${Math.round(r * SCALE)}i64`),
    trading_days: `${annualize ? TRADING_DAYS : 1}u32`,
    annualize_flag: `${annualize}`,
  };
}

/**
 * Generate risk threshold parameters for Leo program
 */
export function encodeRiskParams(
  threshold?: number
): {
  low_threshold: string;
  high_threshold: string;
  custom_threshold: string;
} {
  const SCALE = 1e6;
  const DEFAULT_LOW = 5; // 5% volatility
  const DEFAULT_HIGH = 15; // 15% volatility

  return {
    low_threshold: `${Math.round(DEFAULT_LOW * SCALE)}u64`,
    high_threshold: `${Math.round(DEFAULT_HIGH * SCALE)}u64`,
    custom_threshold: threshold 
      ? `${Math.round(threshold * SCALE)}u64` 
      : "0u64",
  };
}

/**
 * Decode Leo program output to JavaScript types
 */
export function decodeVolatilityOutput(output: string): {
  volatility: number;
  commitment: string;
} {
  // Parse Leo output format: { volatility: 3200000u64, commitment: 123field }
  const volMatch = output.match(/volatility:\s*(\d+)u64/);
  const commitMatch = output.match(/commitment:\s*(\d+)field/);

  return {
    volatility: volMatch ? parseInt(volMatch[1]) / 1e6 : 0,
    commitment: commitMatch ? `${commitMatch[1]}field` : "",
  };
}

/**
 * Decode risk score output from Leo program
 */
export function decodeRiskOutput(output: string): {
  score: number;
  level: "LOW" | "MEDIUM" | "HIGH";
  commitment: string;
} {
  const scoreMatch = output.match(/score:\s*(\d+)u8/);
  const levelMatch = output.match(/level:\s*(\d+)u8/);
  const commitMatch = output.match(/commitment:\s*(\d+)field/);

  const levelValue = levelMatch ? parseInt(levelMatch[1]) : 0;
  const levels: Record<number, "LOW" | "MEDIUM" | "HIGH"> = {
    0: "LOW",
    1: "MEDIUM",
    2: "HIGH",
  };

  return {
    score: scoreMatch ? parseInt(scoreMatch[1]) : 0,
    level: levels[levelValue] || "MEDIUM",
    commitment: commitMatch ? `${commitMatch[1]}field` : "",
  };
}

/**
 * Generate a unique report ID
 */
export function generateReportId(
  owner: string,
  timestamp: number,
  volatilityCommitment: string
): string {
  const input = `${owner}:${timestamp}:${volatilityCommitment}`;
  return hashToField(input).slice(0, 20) + "...";
}

/**
 * Create Aleo address format validation
 */
export function isValidAleoAddress(address: string): boolean {
  return /^aleo1[a-z0-9]{58}$/.test(address);
}

/**
 * Create transaction ID format validation
 */
export function isValidTransactionId(txId: string): boolean {
  return /^at1[a-z0-9]{58}$/.test(txId);
}
