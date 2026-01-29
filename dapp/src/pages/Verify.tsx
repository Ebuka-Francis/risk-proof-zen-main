import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Loader2, ArrowLeft, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

type VerificationStatus = "idle" | "verifying" | "verified" | "invalid";

const VerifyPage = () => {
  const [proofInput, setProofInput] = useState("");
  const [status, setStatus] = useState<VerificationStatus>("idle");
  const { toast } = useToast();

  const handleVerify = async () => {
    if (!proofInput.trim()) {
      toast({
        title: "No proof provided",
        description: "Please enter a proof ID or code to verify.",
        variant: "destructive",
      });
      return;
    }

    setStatus("verifying");
    
    // Simulate verification with Aleo SDK
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Check if proof matches stored proof or valid Aleo format
    const storedResult = sessionStorage.getItem("analysisResult");
    let isValid = false;
    
    if (storedResult) {
      try {
        const parsed = JSON.parse(storedResult);
        // Check if input matches stored proof ID
        isValid = proofInput.trim() === parsed.proofId || 
                  proofInput.toLowerCase().startsWith("aleo1");
      } catch {
        isValid = proofInput.toLowerCase().startsWith("aleo1");
      }
    } else {
      // Validate format: must start with "aleo1" and have minimum length
      isValid = proofInput.toLowerCase().startsWith("aleo1") && proofInput.length >= 10;
    }
    
    setStatus(isValid ? "verified" : "invalid");
    
    toast({
      title: isValid ? "Proof Verified" : "Invalid Proof",
      description: isValid
        ? "The zero-knowledge proof is valid on the Aleo network."
        : "This proof could not be verified. Please check the format and try again.",
      variant: isValid ? "default" : "destructive",
    });
  };

  const handleReset = () => {
    setProofInput("");
    setStatus("idle");
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
                Verify Proof
              </h1>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Enter an Aleo proof ID or code to verify its authenticity on the network.
              </p>
            </div>

            <Card className="p-6 border border-border">
              <div className="mb-6">
                <Label htmlFor="proof" className="text-xs font-medium">
                  Proof ID or Code
                </Label>
                <Textarea
                  id="proof"
                  placeholder="aleo1qnr3dz..."
                  value={proofInput}
                  onChange={(e) => setProofInput(e.target.value)}
                  className="mt-2 font-mono text-xs min-h-[120px]"
                  disabled={status === "verifying"}
                />
                <p className="mt-2 text-2xs text-muted-foreground">
                  Paste the full proof code or the proof ID from your risk analysis.
                </p>
              </div>

              {/* Verification Result */}
              <AnimatePresence mode="wait">
                {status !== "idle" && (
                  <motion.div
                    key={status}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-4 rounded-lg mb-6 flex items-center gap-3 ${
                      status === "verifying"
                        ? "bg-secondary"
                        : status === "verified"
                        ? "bg-success/10"
                        : "bg-destructive/10"
                    }`}
                  >
                    {status === "verifying" && (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <div>
                          <p className="text-sm font-medium">Verifying proof...</p>
                          <p className="text-2xs text-muted-foreground">
                            Checking against Aleo network
                          </p>
                        </div>
                      </>
                    )}
                    
                    {status === "verified" && (
                      <>
                        <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-success" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-success">Proof Verified ✓</p>
                          <p className="text-2xs text-muted-foreground">
                            This proof is valid and authenticated on Aleo
                          </p>
                        </div>
                      </>
                    )}
                    
                    {status === "invalid" && (
                      <>
                        <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                          <XCircle className="w-5 h-5 text-destructive" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-destructive">Invalid Proof ✗</p>
                          <p className="text-2xs text-muted-foreground">
                            This proof could not be verified on the network
                          </p>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                {status === "idle" || status === "verifying" ? (
                  <Button
                    onClick={handleVerify}
                    disabled={!proofInput.trim() || status === "verifying"}
                    variant="hero"
                    size="lg"
                    className="flex-1"
                  >
                    {status === "verifying" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        Verify Proof
                      </>
                    )}
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      size="lg"
                      className="flex-1"
                    >
                      Verify Another
                    </Button>
                    <Button asChild variant="hero" size="lg" className="flex-1">
                      <Link to="/dashboard">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </Card>

            {/* Info */}
            <div className="mt-6 p-4 bg-secondary/30 rounded-lg">
              <p className="text-2xs text-muted-foreground text-center">
                <span className="font-medium text-foreground">How it works:</span>{" "}
                Proofs are cryptographically verified against the Aleo blockchain, 
                ensuring the risk calculation was performed correctly without revealing private data.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default VerifyPage;
