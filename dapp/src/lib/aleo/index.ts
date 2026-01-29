// Aleo SDK Integration - Main Export
// Re-exports all Aleo functionality for clean imports

export * from "./types";
export * from "./crypto";
export * from "./program";
export * from "./wallet";

// Convenience re-exports
export {
  ALEO_RISK_PROGRAM,
  LEO_FUNCTIONS,
  TESTNET_CHAIN_ID,
  EXPLORER_BASE_URL,
} from "./types";

export {
  LEO_PROGRAM_SOURCE,
  buildRegisterPortfolioTx,
  buildComputeVolatilityTx,
  buildComputeRiskScoreTx,
  buildVerifyRiskReportTx,
  buildExportReceiptTx,
  getExplorerUrl,
  simulateTransaction,
} from "./program";

export {
  formatAddress,
  getNetworkName,
  getTransactionHistory,
  addTransactionToHistory,
  getExplorerTransactionUrl,
  isValidAleoAddress,
  isValidTransactionId,
} from "./wallet";
