// Leo Program: AleoRisk Private Risk Engine
// This module contains the Leo program source and transaction builders

import {
  ALEO_RISK_PROGRAM,
  LEO_FUNCTIONS,
  TESTNET_CHAIN_ID,
  EXPLORER_BASE_URL,
  type AleoRiskTransaction,
  type PortfolioCommitment,
  type VolatilityResult,
  type RiskScore,
  type RiskReceipt,
  type TransactionStatus,
} from "./types";
import {
  generatePortfolioCommitment,
  encodeVolatilityParams,
  encodeRiskParams,
  generateReportId,
  hashToField,
} from "./crypto";

/**
 * Leo Program Source Code
 * 
 * This is the AleoRisk private risk computation program.
 * It computes volatility and risk scores using zero-knowledge proofs,
 * keeping portfolio data private while generating verifiable results.
 */
export const LEO_PROGRAM_SOURCE = `
// AleoRisk Leo Program - Privacy-Preserving Risk Analytics
// Program ID: aleo_risk_v1.aleo

program aleo_risk_v1.aleo {
    // Portfolio commitment record - stores private portfolio hash
    record PortfolioRecord {
        owner: address,
        commitment: field,
        timestamp: u64,
        data_points: u32,
    }

    // Risk report record - verifiable risk computation result
    record RiskReport {
        owner: address,
        report_id: field,
        volatility_commitment: field,
        risk_commitment: field,
        risk_level: u8,  // 0=LOW, 1=MEDIUM, 2=HIGH
        timestamp: u64,
        verified: bool,
    }

    // Mapping for public verification
    mapping verified_reports: field => bool;
    mapping report_metadata: field => u64;

    // Register portfolio with private commitment
    // Inputs: commitment hash of portfolio returns/weights
    // Output: PortfolioRecord with ownership proof
    transition register_portfolio(
        private commitment: field,
        private data_points: u32
    ) -> PortfolioRecord {
        let timestamp: u64 = block.height as u64;
        
        return PortfolioRecord {
            owner: self.caller,
            commitment: commitment,
            timestamp: timestamp,
            data_points: data_points,
        };
    }

    // Compute volatility from private portfolio data
    // Uses rolling variance calculation in ZK
    // Returns: volatility value and commitment
    transition compute_volatility(
        private portfolio: PortfolioRecord,
        private mean_scaled: i64,
        private variance_scaled: u64,
        private trading_days: u32
    ) -> (u64, field) {
        // Verify ownership
        assert_eq(portfolio.owner, self.caller);
        
        // Compute annualized volatility
        // volatility = sqrt(variance) * sqrt(trading_days)
        // Using scaled integer arithmetic for ZK compatibility
        let sqrt_variance: u64 = sqrt_approx(variance_scaled);
        let sqrt_days: u64 = 15874u64;  // sqrt(252) * 1000
        let volatility: u64 = (sqrt_variance * sqrt_days) / 1000u64;
        
        // Generate volatility commitment
        let vol_commitment: field = BHP256::hash_to_field(volatility);
        
        return (volatility, vol_commitment);
    }

    // Compute risk score from volatility
    // Classifies into LOW/MEDIUM/HIGH based on thresholds
    transition compute_risk_score(
        private volatility: u64,
        private vol_commitment: field,
        private low_threshold: u64,
        private high_threshold: u64
    ) -> (u8, u8, field) {
        // Determine risk level
        let risk_level: u8 = 
            volatility < low_threshold ? 0u8 :
            volatility > high_threshold ? 2u8 : 1u8;
        
        // Calculate risk score (0-100)
        let risk_score: u8 = 
            risk_level == 0u8 ? 25u8 :
            risk_level == 2u8 ? 85u8 : 50u8;
        
        // Generate risk commitment
        let risk_commitment: field = BHP256::hash_to_field(
            risk_level as field + vol_commitment
        );
        
        return (risk_score, risk_level, risk_commitment);
    }

    // Verify risk report publicly
    // Updates public mapping for third-party verification
    async transition verify_risk_report(
        public risk_commitment: field
    ) -> Future {
        return finalize_verify(risk_commitment);
    }

    async function finalize_verify(commitment: field) {
        Mapping::set(verified_reports, commitment, true);
        Mapping::set(report_metadata, commitment, block.height);
    }

    // Export verifiable risk receipt
    // Creates RiskReport record with all verification data
    transition export_risk_receipt(
        private vol_commitment: field,
        private risk_commitment: field,
        private risk_level: u8
    ) -> RiskReport {
        let timestamp: u64 = block.height as u64;
        let report_id: field = BHP256::hash_to_field(
            vol_commitment + risk_commitment + timestamp as field
        );
        
        return RiskReport {
            owner: self.caller,
            report_id: report_id,
            volatility_commitment: vol_commitment,
            risk_commitment: risk_commitment,
            risk_level: risk_level,
            timestamp: timestamp,
            verified: true,
        };
    }

    // Helper: Integer square root approximation
    // Newton-Raphson method for ZK-compatible sqrt
    function sqrt_approx(n: u64) -> u64 {
        if n == 0u64 {
            return 0u64;
        }
        let mut x: u64 = n;
        let mut y: u64 = (x + 1u64) / 2u64;
        
        // 8 iterations for convergence
        for i: u8 in 0u8..8u8 {
            if y < x {
                x = y;
                y = (x + n / x) / 2u64;
            }
        }
        return x;
    }
}
`;

/**
 * Build register_portfolio transaction
 */
export function buildRegisterPortfolioTx(
  address: string,
  returns: number[],
  weights?: number[]
): AleoRiskTransaction {
  const commitment = generatePortfolioCommitment(returns, weights);
  const dataPoints = returns.length;

  return {
    address,
    chainId: TESTNET_CHAIN_ID as "testnet",
    transitions: [
      {
        program: ALEO_RISK_PROGRAM,
        functionName: LEO_FUNCTIONS.REGISTER_PORTFOLIO,
        inputs: [commitment, `${dataPoints}u32`],
      },
    ],
    fee: 100000, // 0.1 Aleo credits
    feePrivate: false,
  };
}

/**
 * Build compute_volatility transaction
 */
export function buildComputeVolatilityTx(
  address: string,
  portfolioRecord: string,
  returns: number[]
): AleoRiskTransaction {
  // Calculate mean and variance locally (private inputs)
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance =
    returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;

  const SCALE = 1e6;
  const meanScaled = Math.round(mean * SCALE);
  const varianceScaled = Math.round(variance * SCALE * SCALE);
  const tradingDays = 252;

  return {
    address,
    chainId: TESTNET_CHAIN_ID as "testnet",
    transitions: [
      {
        program: ALEO_RISK_PROGRAM,
        functionName: LEO_FUNCTIONS.COMPUTE_VOLATILITY,
        inputs: [
          portfolioRecord,
          `${meanScaled}i64`,
          `${varianceScaled}u64`,
          `${tradingDays}u32`,
        ],
      },
    ],
    fee: 150000, // 0.15 Aleo credits
    feePrivate: false,
  };
}

/**
 * Build compute_risk_score transaction
 */
export function buildComputeRiskScoreTx(
  address: string,
  volatility: number,
  volCommitment: string,
  threshold?: number
): AleoRiskTransaction {
  const SCALE = 1e6;
  const volatilityScaled = Math.round(volatility * SCALE);
  const { low_threshold, high_threshold } = encodeRiskParams(threshold);

  return {
    address,
    chainId: TESTNET_CHAIN_ID as "testnet",
    transitions: [
      {
        program: ALEO_RISK_PROGRAM,
        functionName: LEO_FUNCTIONS.COMPUTE_RISK_SCORE,
        inputs: [
          `${volatilityScaled}u64`,
          volCommitment,
          low_threshold,
          high_threshold,
        ],
      },
    ],
    fee: 100000,
    feePrivate: false,
  };
}

/**
 * Build verify_risk_report transaction
 */
export function buildVerifyRiskReportTx(
  address: string,
  riskCommitment: string
): AleoRiskTransaction {
  return {
    address,
    chainId: TESTNET_CHAIN_ID as "testnet",
    transitions: [
      {
        program: ALEO_RISK_PROGRAM,
        functionName: LEO_FUNCTIONS.VERIFY_RISK_REPORT,
        inputs: [riskCommitment],
      },
    ],
    fee: 50000,
    feePrivate: false,
  };
}

/**
 * Build export_risk_receipt transaction
 */
export function buildExportReceiptTx(
  address: string,
  volCommitment: string,
  riskCommitment: string,
  riskLevel: "LOW" | "MEDIUM" | "HIGH"
): AleoRiskTransaction {
  const levelMap = { LOW: "0u8", MEDIUM: "1u8", HIGH: "2u8" };

  return {
    address,
    chainId: TESTNET_CHAIN_ID as "testnet",
    transitions: [
      {
        program: ALEO_RISK_PROGRAM,
        functionName: LEO_FUNCTIONS.EXPORT_RISK_RECEIPT,
        inputs: [volCommitment, riskCommitment, levelMap[riskLevel]],
      },
    ],
    fee: 75000,
    feePrivate: false,
  };
}

/**
 * Get transaction explorer URL
 */
export function getExplorerUrl(txId: string): string {
  return `${EXPLORER_BASE_URL}/${txId}`;
}

/**
 * Simulate transaction execution (for demo/testing)
 * In production, this would use the actual Aleo wallet adapter
 */
export async function simulateTransaction(
  tx: AleoRiskTransaction,
  functionName: string
): Promise<{
  txId: string;
  status: TransactionStatus;
  output: unknown;
}> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Generate mock transaction ID
  const txId = `at1${Array.from({ length: 58 }, () =>
    "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]
  ).join("")}`;

  const status: TransactionStatus = {
    tx_id: txId,
    status: "confirmed",
    block_height: Math.floor(Math.random() * 1000000) + 500000,
    confirmations: 6,
    explorer_url: getExplorerUrl(txId),
  };

  // Generate mock outputs based on function
  let output: unknown = {};
  
  switch (functionName) {
    case LEO_FUNCTIONS.REGISTER_PORTFOLIO:
      output = {
        commitment: hashToField(JSON.stringify(tx.transitions[0].inputs)),
        timestamp: Date.now(),
      };
      break;
    case LEO_FUNCTIONS.COMPUTE_VOLATILITY:
      output = {
        volatility: Math.random() * 20 + 1,
        commitment: hashToField(`vol_${Date.now()}`),
      };
      break;
    case LEO_FUNCTIONS.COMPUTE_RISK_SCORE:
      const levels = ["LOW", "MEDIUM", "HIGH"] as const;
      output = {
        score: Math.floor(Math.random() * 100),
        level: levels[Math.floor(Math.random() * 3)],
        commitment: hashToField(`risk_${Date.now()}`),
      };
      break;
    case LEO_FUNCTIONS.VERIFY_RISK_REPORT:
      output = { verified: true };
      break;
    case LEO_FUNCTIONS.EXPORT_RISK_RECEIPT:
      output = {
        reportId: generateReportId(
          tx.address,
          Date.now(),
          tx.transitions[0].inputs[0]
        ),
        verified: true,
      };
      break;
  }

  return { txId, status, output };
}
