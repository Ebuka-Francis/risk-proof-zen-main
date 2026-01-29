import { useState, useCallback, useRef, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileUp, AlertCircle, ArrowRight, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import {
  DecryptPermission,
  WalletAdapterNetwork,
  WalletReadyState,
} from "@demox-labs/aleo-wallet-adapter-base";
import { useRiskAnalysis } from "@/hooks/useRiskAnalysis";
import { AnalysisProgress } from "@/components/aleo/AnalysisProgress";
import { TransactionList } from "@/components/aleo/TransactionList";
import { useToast } from "@/hooks/use-toast";

const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [threshold, setThreshold] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { publicKey, wallet, wallets, connected, connect, connecting, select } = useWallet();
  const { isAnalyzing, currentStep, progress, transactions, analyzePortfolio } = useRiskAnalysis(publicKey);

  // Find Leo Wallet
  const leoWallet = wallets.find((w) => w.adapter.name === "Leo Wallet");

  // Auto-connect after wallet selection
  useEffect(() => {
    if (wallet && !connected && !connecting && isConnecting) {
      connect(
        DecryptPermission.UponRequest,
        WalletAdapterNetwork.TestnetBeta
      ).then(() => {
        setIsConnecting(false);
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

  const handleWalletConnect = async () => {
    if (!leoWallet) {
      toast({
        title: "Wallet Not Found",
        description: "Please install Leo Wallet extension from leo.app",
        variant: "destructive",
      });
      window.open("https://leo.app/", "_blank");
      return;
    }

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
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith(".csv")) {
        setFile(droppedFile);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a CSV file.",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleGenerateProof = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please upload a CSV file first.",
        variant: "destructive",
      });
      return;
    }

    if (!connected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your Aleo wallet to generate proofs.",
        variant: "destructive",
      });
      return;
    }

    const thresholdValue = threshold ? parseFloat(threshold) : undefined;
    const result = await analyzePortfolio(file, thresholdValue);

    if (result) {
      sessionStorage.setItem("analysisResult", JSON.stringify(result));
      sessionStorage.setItem("aleoTransactions", JSON.stringify(transactions));
      navigate("/dashboard");
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] py-20">
        <div className="container mx-auto px-6 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-10">
              <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight mb-3">
                Upload Data
              </h1>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Upload your historical returns CSV to generate a zero-knowledge risk proof on Aleo.
              </p>
            </div>

            {/* Wallet Connection Status */}
            {!connected && (
              <Card className="p-4 border border-warning/30 bg-warning/5 mb-6">
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-warning" />
                  <div className="flex-1">
                    <p className="text-xs font-medium">Wallet Required</p>
                    <p className="text-2xs text-muted-foreground">
                      Connect your Aleo wallet to generate verifiable proofs on testnet.
                    </p>
                  </div>
                  <Button 
                    variant="hero-outline" 
                    size="sm" 
                    onClick={handleWalletConnect}
                    disabled={connecting || isConnecting}
                  >
                    {(connecting || isConnecting) ? "Connecting..." : "Connect"}
                  </Button>
                </div>
              </Card>
            )}

            <Card className="p-6 border border-border">
              {/* File Upload Zone */}
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? "border-foreground bg-secondary/50"
                    : file
                    ? "border-success/50 bg-success/5"
                    : "border-border hover:border-muted-foreground"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <AnimatePresence mode="wait">
                  {file ? (
                    <motion.div
                      key="file"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <FileUp className="w-8 h-8 mx-auto mb-3 text-success" />
                      <p className="text-xs font-medium">{file.name}</p>
                      <p className="text-2xs text-muted-foreground mt-1">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-3 text-2xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                      >
                        Remove
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-xs font-medium">
                        Drop your CSV file here
                      </p>
                      <p className="text-2xs text-muted-foreground mt-1">
                        or click to browse
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Threshold Input */}
              <div className="mt-6">
                <Label htmlFor="threshold" className="text-xs font-medium">
                  Risk Threshold (optional)
                </Label>
                <Input
                  id="threshold"
                  type="number"
                  placeholder="e.g., 10 (for 10% volatility)"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="mt-2 text-xs"
                />
                <p className="mt-1.5 text-2xs text-muted-foreground">
                  Custom threshold for LOW/HIGH classification. Leave empty for default (5%/15%).
                </p>
              </div>

              {/* Analysis Progress */}
              {isAnalyzing && (
                <div className="mt-6 p-4 bg-secondary/30 rounded-lg">
                  <AnalysisProgress currentStep={currentStep} progress={progress} />
                </div>
              )}

              {/* Transaction List */}
              {transactions.length > 0 && (
                <div className="mt-6">
                  <TransactionList transactions={transactions} />
                </div>
              )}

              {/* Generate Button */}
              <Button
                onClick={handleGenerateProof}
                disabled={!file || !connected || isAnalyzing}
                variant="hero"
                size="lg"
                className="w-full mt-6"
              >
                {isAnalyzing ? (
                  "Generating Proof..."
                ) : (
                  <>
                    Generate Risk Proof
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              {/* Info */}
              <div className="mt-4 flex items-start gap-2 p-3 bg-secondary/30 rounded-lg">
                <AlertCircle className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-2xs text-muted-foreground">
                  Your data stays private. Only cryptographic commitments are submitted to the Aleo network.
                  The proof generation uses zero-knowledge techniques to verify computation without revealing inputs.
                </p>
              </div>
            </Card>

            {/* CSV Format Info */}
            <div className="mt-6 p-4 bg-secondary/20 rounded-lg">
              <p className="text-2xs font-medium mb-2">CSV Format</p>
              <pre className="text-2xs text-muted-foreground font-mono bg-background p-2 rounded">
{`date,return_pct
2024-01-01,1.2
2024-01-02,-0.5
2024-01-03,0.8`}
              </pre>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default UploadPage;
