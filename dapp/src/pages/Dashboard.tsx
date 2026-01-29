import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, CheckCircle, TrendingUp, AlertTriangle, BarChart3, Database } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { RiskGauge } from "@/components/dashboard/RiskGauge";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { VolatilityChart } from "@/components/dashboard/VolatilityChart";
import type { AnalysisResult } from "@/types/analysis";

// Default data for demo purposes
const defaultResult: AnalysisResult = {
  volatility: 3.2,
  riskLevel: "LOW",
  meanReturn: 0.8,
  dataPoints: 252,
  monthlyVolatility: [
    { date: "Jan", volatility: 2.1 },
    { date: "Feb", volatility: 2.8 },
    { date: "Mar", volatility: 3.5 },
    { date: "Apr", volatility: 2.9 },
    { date: "May", volatility: 3.2 },
    { date: "Jun", volatility: 2.7 },
    { date: "Jul", volatility: 3.1 },
    { date: "Aug", volatility: 3.4 },
    { date: "Sep", volatility: 2.6 },
    { date: "Oct", volatility: 3.0 },
    { date: "Nov", volatility: 2.8 },
    { date: "Dec", volatility: 3.2 },
  ],
  proofId: "aleo1qnr3dz...8f4a",
  isVerified: true,
  timestamp: new Date(),
};

const DashboardPage = () => {
  const [result, setResult] = useState<AnalysisResult>(defaultResult);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = sessionStorage.getItem("analysisResult");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setResult({
          ...parsed,
          timestamp: new Date(parsed.timestamp),
        });
      } catch {
        // Use default data if parsing fails
      }
    }
  }, []);

  const getRiskColor = (level: string) => {
    switch (level) {
      case "LOW":
        return "bg-success/10 text-success border-success/20";
      case "MEDIUM":
        return "bg-warning/10 text-warning border-warning/20";
      case "HIGH":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-secondary text-foreground border-border";
    }
  };

  const handleDownloadReport = () => {
    const report = {
      title: "AleoRisk Analysis Report",
      generatedAt: result.timestamp,
      metrics: {
        volatility: `${result.volatility}%`,
        riskLevel: result.riskLevel,
        meanReturn: `${result.meanReturn}%`,
        dataPoints: result.dataPoints,
      },
      proof: {
        id: result.proofId,
        verified: result.isVerified,
      },
      monthlyData: result.monthlyVolatility,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aleo-risk-report-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="min-h-[80vh] py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight mb-2">
                  Risk Analysis Dashboard
                </h1>
                <p className="text-xs text-muted-foreground">
                  Your portfolio risk metrics, verified on Aleo.
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/upload">
                    New Analysis
                  </Link>
                </Button>
                <Button variant="hero" size="sm" onClick={handleDownloadReport}>
                  <Download className="w-4 h-4" />
                  Download Report
                </Button>
              </div>
            </div>

            {/* Risk Gauge Section */}
            <Card className="p-8 border border-border mb-8">
              <div className="flex flex-col md:flex-row items-center justify-around gap-8">
                <RiskGauge riskLevel={result.riskLevel} volatility={result.volatility} />
                
                <div className="text-center md:text-left">
                  <p className="text-2xs uppercase tracking-widest text-muted-foreground mb-2">
                    Proof Status
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    {result.isVerified ? (
                      <Badge className="bg-success/10 text-success border-success/20 text-xs px-3 py-1">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified on Aleo
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs px-3 py-1">
                        Pending Verification
                      </Badge>
                    )}
                  </div>
                  <p className="text-2xs text-muted-foreground font-mono">
                    {result.proofId}
                  </p>
                </div>
              </div>
            </Card>

            {/* Metrics Grid */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <MetricCard
                label="Volatility"
                value={`${result.volatility}%`}
                description="Annualized standard deviation"
                icon={TrendingUp}
              />
              <MetricCard
                label="Risk Score"
                value={
                  <Badge className={`${getRiskColor(result.riskLevel)} text-xs px-3 py-1 mt-1`}>
                    {result.riskLevel}
                  </Badge>
                }
                description="Based on volatility threshold"
                icon={AlertTriangle}
              />
              <MetricCard
                label="Mean Return"
                value={`${result.meanReturn}%`}
                description="Average daily return"
                icon={BarChart3}
              />
              <MetricCard
                label="Data Points"
                value={result.dataPoints.toString()}
                description="Total observations analyzed"
                icon={Database}
              />
            </div>

            {/* Volatility Chart */}
            <VolatilityChart data={result.monthlyVolatility} />

            {/* Actions */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link to="/verify">
                  Verify Proof
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  console.log("Raw analysis data:", result);
                  alert("Check browser console for raw data");
                }}
              >
                View Raw Data
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
