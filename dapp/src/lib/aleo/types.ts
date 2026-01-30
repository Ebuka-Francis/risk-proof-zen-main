// Aleo Risk Analysis Types

export interface AleoWalletState {
  address: string | null;
  network: "testnet" | "mainnet";
  connected: boolean;
  connecting: boolean;
}

export interface PortfolioCommitment {
  commitment_hash: string;
  owner: string;
  timestamp: number;
  data_points: number;
}

export interface VolatilityResult {
  volatility_value: number;
  vol_commitment: string;
  metadata: {
    mean_return: number;
    variance: number;
    std_dev: number;
    annualized: boolean;
  };
  tx_id: string;
}

export interface RiskScore {
  risk_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  risk_commitment: string;
  threshold_used: number;
  tx_id: string;
}

export interface RiskReceipt {
  report_id: string;
  timestamp: number;
  params_hash: string;
  owner: string;
  volatility_commitment: string;
  risk_commitment: string;
  verified: boolean;
  tx_id: string;
  explorer_url: string;
}

export interface TransactionStatus {
  tx_id: string;
  status: "pending" | "confirmed" | "failed";
  block_height?: number;
  confirmations?: number;
  explorer_url: string;
}

export interface AleoRiskTransaction {
  address: string;
  chainId: "testnet" | "mainnet";
  transitions: AleoTransition[];
  fee: number;
  feePrivate: boolean;
}

export interface AleoTransition {
  program: string;
  functionName: string;
  inputs: string[];
}

// Leo Program Constants
export const ALEO_RISK_PROGRAM = "risk_proof_v1.aleo";
export const TESTNET_CHAIN_ID = "testnetbeta";
export const EXPLORER_BASE_URL = "https://explorer.aleo.org/transaction";

// Program Functions
export const LEO_FUNCTIONS = {
  REGISTER_PORTFOLIO: "register_portfolio",
  COMPUTE_VOLATILITY: "compute_volatility",
  COMPUTE_RISK_SCORE: "compute_risk_score",
  VERIFY_RISK_REPORT: "verify_risk_report",
  EXPORT_RISK_RECEIPT: "export_risk_receipt",
} as const;
