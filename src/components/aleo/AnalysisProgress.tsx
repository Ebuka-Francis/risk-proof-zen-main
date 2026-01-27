import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface AnalysisProgressProps {
  currentStep: string;
  progress: number;
}

export function AnalysisProgress({ currentStep, progress }: AnalysisProgressProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-xs">{currentStep}</span>
      </div>
      <Progress value={progress} className="h-1" />
      <p className="text-2xs text-muted-foreground text-center">
        Executing zero-knowledge computations on Aleo testnet...
      </p>
    </motion.div>
  );
}
