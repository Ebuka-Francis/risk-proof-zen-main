import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wallet, LogOut, Copy, ExternalLink, Loader2 } from "lucide-react";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import {
  DecryptPermission,
  WalletAdapterNetwork,
  WalletReadyState,
} from "@demox-labs/aleo-wallet-adapter-base";
import { useToast } from "@/hooks/use-toast";
import { useCallback, useEffect, useState } from "react";

export function WalletButton() {
  const {
    publicKey,
    wallet,
    wallets,
    connected,
    connecting,
    connect,
    disconnect,
    select,
  } = useWallet();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);

  // Format address for display
  const formattedAddress = publicKey
    ? `${publicKey.slice(0, 10)}...${publicKey.slice(-6)}`
    : "";

  // Find Leo Wallet adapter
  const leoWallet = wallets.find(
    (w) => w.adapter.name === "Leo Wallet"
  );

  // Auto-connect after wallet selection
  useEffect(() => {
    if (wallet && !connected && !connecting && isConnecting) {
      connect(
        DecryptPermission.UponRequest,
        WalletAdapterNetwork.TestnetBeta
      ).then(() => {
        setIsConnecting(false);
        toast({
          title: "Wallet Connected",
          description: "Successfully connected to Aleo Testnet Beta.",
        });
      }).catch((error) => {
        setIsConnecting(false);
        console.error("Connection error:", error);
        toast({
          title: "Connection Failed",
          description: error instanceof Error ? error.message : "Failed to connect wallet.",
          variant: "destructive",
        });
      });
    }
  }, [wallet, connected, connecting, isConnecting, connect, toast]);

  const handleConnect = useCallback(async () => {
    // Check if Leo Wallet is installed
    if (!leoWallet) {
      toast({
        title: "Wallet Not Found",
        description: "Please install Leo Wallet extension from leo.app",
        variant: "destructive",
      });
      window.open("https://leo.app/", "_blank");
      return;
    }

    // Check if wallet is ready (installed)
    if (leoWallet.readyState !== WalletReadyState.Installed) {
      toast({
        title: "Leo Wallet Not Installed",
        description: "Please install Leo Wallet extension to continue.",
        variant: "destructive",
      });
      window.open("https://leo.app/", "_blank");
      return;
    }

    // Set connecting state and select wallet
    setIsConnecting(true);
    select(leoWallet.adapter.name);
  }, [leoWallet, select, toast]);

  const handleCopyAddress = useCallback(() => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard.",
      });
    }
  }, [publicKey, toast]);

  const handleDisconnect = useCallback(async () => {
    try {
      await disconnect();
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected.",
      });
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  }, [disconnect, toast]);

  // If not connected, show connect button
  if (!connected) {
    return (
      <Button
        variant="hero-outline"
        size="sm"
        onClick={handleConnect}
        disabled={connecting || isConnecting}
      >
        {(connecting || isConnecting) ? (
          <>
            <Loader2 className="w-3 h-3 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="w-3 h-3" />
            Connect Wallet
          </>
        )}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="hero-outline" size="sm" className="font-mono text-2xs">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          {formattedAddress}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5">
          <p className="text-2xs text-muted-foreground">Aleo Testnet Beta</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCopyAddress} className="text-xs">
          <Copy className="w-3 h-3 mr-2" />
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="text-xs">
          <a
            href={`https://explorer.aleo.org/address/${publicKey}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="w-3 h-3 mr-2" />
            View on Explorer
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDisconnect} className="text-xs text-destructive">
          <LogOut className="w-3 h-3 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
