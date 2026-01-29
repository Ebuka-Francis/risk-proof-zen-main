import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 grid-pattern opacity-40" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl"
          >
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight">
              Privacy-Preserving Risk Analytics
            </h1>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-md">
              Compute verified portfolio risk and volatility without revealing your private financial data. Powered by Aleo's zero-knowledge proofs.
            </p>
            
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="lg">
                <Link to="/upload">
                  Start Risk Analysis
                </Link>
              </Button>
              <Button asChild variant="hero-outline" size="lg">
                <Link to="/dashboard" className="flex items-center gap-2">
                  Explore Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Globe Visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:flex justify-center items-center"
          >
            <div className="relative w-[400px] h-[400px]">
              {/* Dotted Globe Pattern */}
              <div className="absolute inset-0 rounded-full dotted-pattern opacity-30" />
              <svg
                viewBox="0 0 400 400"
                className="w-full h-full"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Outer Circle */}
                <circle
                  cx="200"
                  cy="200"
                  r="180"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  className="text-border"
                />
                {/* Inner Circles */}
                <circle
                  cx="200"
                  cy="200"
                  r="140"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="2 6"
                  className="text-muted-foreground/30"
                />
                <circle
                  cx="200"
                  cy="200"
                  r="100"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="2 6"
                  className="text-muted-foreground/20"
                />
                {/* Horizontal Lines */}
                <line x1="20" y1="200" x2="380" y2="200" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="text-border" />
                <line x1="60" y1="120" x2="340" y2="120" stroke="currentColor" strokeWidth="1" strokeDasharray="2 6" className="text-muted-foreground/20" />
                <line x1="60" y1="280" x2="340" y2="280" stroke="currentColor" strokeWidth="1" strokeDasharray="2 6" className="text-muted-foreground/20" />
                {/* Vertical Arc */}
                <ellipse cx="200" cy="200" rx="60" ry="180" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="text-border" />
              </svg>
              
              {/* Floating Labels */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-12 right-8 bg-background border border-border px-3 py-1.5 rounded-full shadow-sm"
              >
                <span className="text-2xs font-medium">Volatility: 3.2%</span>
              </motion.div>
              
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-20 left-4 bg-background border border-border px-3 py-1.5 rounded-full shadow-sm"
              >
                <span className="text-2xs font-medium">Risk: LOW ✓</span>
              </motion.div>
              
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-1/2 right-0 bg-background border border-border px-3 py-1.5 rounded-full shadow-sm"
              >
                <span className="text-2xs font-medium">Proof Verified ✓</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
