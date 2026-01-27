import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function CTASection() {
  return (
    <section className="py-20 border-t border-border">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight mb-4">
            Ready to analyze your portfolio risk privately?
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            Start computing verified risk metrics today. No registration required.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild variant="hero" size="lg">
              <Link to="/upload">
                Start Risk Analysis
              </Link>
            </Button>
            <Button asChild variant="hero-outline" size="lg">
              <Link to="/verify" className="flex items-center gap-2">
                Verify a Proof
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
