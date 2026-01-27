import { useCallback } from "react";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import {
  DecryptPermission,
  WalletAdapterNetwork,
} from "@demox-labs/aleo-wallet-adapter-base";

/**
 * Custom hook wrapping the official Aleo wallet adapter
 * Provides a simplified interface for wallet operations
 */
export function useAleoWallet() {
  const {
    publicKey,
    wallet,
    connected,
    connecting,
    connect,
    disconnect,
    signMessage,
    requestTransaction,
    transactionStatus,
  } = useWallet();

  const handleConnect = useCallback(async () => {
    try {
      // Connect with DecryptPermission and network as required by the adapter
      await connect(
        DecryptPermission.UponRequest,
        WalletAdapterNetwork.TestnetBeta
      );
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    }
  }, [connect]);

  const handleDisconnect = useCallback(async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
      throw error;
    }
  }, [disconnect]);

  // Format address for display (truncated)
  const formatAddress = (address: string | null): string => {
    if (!address) return "";
    return `${address.slice(0, 10)}...${address.slice(-6)}`;
  };

  return {
    // State
    address: publicKey,
    connected,
    connecting,
    wallet,
    
    // Actions
    connect: handleConnect,
    disconnect: handleDisconnect,
    signMessage,
    requestTransaction,
    transactionStatus,
    
    // Helpers
    formattedAddress: formatAddress(publicKey),
    networkName: "Aleo Testnet Beta",
    network: WalletAdapterNetwork.TestnetBeta,
  };
}
