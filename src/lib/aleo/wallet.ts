// Aleo Wallet Utilities
// Helper functions for wallet operations using @demox-labs/aleo-wallet-adapter

import type { TransactionStatus } from "./types";
import { EXPLORER_BASE_URL } from "./types";

/**
 * Get transaction history from session storage
 */
export async function getTransactionHistory(): Promise<TransactionStatus[]> {
  const stored = sessionStorage.getItem("aleoTransactions");
  
  if (stored) {
    return JSON.parse(stored);
  }
  
  return [];
}

/**
 * Store transaction in history
 */
export function addTransactionToHistory(tx: TransactionStatus): void {
  const history = JSON.parse(
    sessionStorage.getItem("aleoTransactions") || "[]"
  );
  history.unshift(tx);
  sessionStorage.setItem("aleoTransactions", JSON.stringify(history.slice(0, 50)));
}

/**
 * Format address for display (truncated)
 */
export function formatAddress(address: string | null): string {
  if (!address) return "";
  return `${address.slice(0, 10)}...${address.slice(-6)}`;
}

/**
 * Get network name for display
 */
export function getNetworkName(network: "testnet" | "mainnet"): string {
  return network === "testnet" ? "Aleo Testnet Beta" : "Aleo Mainnet";
}

/**
 * Get explorer URL for a transaction
 */
export function getExplorerTransactionUrl(txId: string): string {
  return `${EXPLORER_BASE_URL}/${txId}`;
}

/**
 * Validate Aleo address format
 */
export function isValidAleoAddress(address: string): boolean {
  return /^aleo1[a-z0-9]{58}$/.test(address);
}

/**
 * Validate Aleo transaction ID format
 */
export function isValidTransactionId(txId: string): boolean {
  return /^at1[a-z0-9]{58}$/.test(txId);
}
