import { Shield, Lock, Zap, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Shield,
    title: "Default Privacy",
    description: "Your financial data never leaves your device. All computations happen client-side using zero-knowledge proofs.",
  },
  {
    icon: Lock,
    title: "Verified Results",
    description: "Every risk calculation generates a cryptographic proof that anyone can verify without seeing your data.",
  },
  {
    icon: Zap,
    title: "Fast & Efficient",
    description: "Optimized ZK circuits deliver results in seconds, not minutes. Built for real-world portfolio analysis.",
  },
  {
    icon: CheckCircle,
    title: "Compliant",
    description: "Meet regulatory requirements while keeping sensitive financial information private.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-2xs uppercase tracking-widest text-muted-foreground mb-3">
            Privacy Without Compromising Compliance
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">
            AleoRisk delivers verified analytics, secured by zero-knowledge proofs
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-6 border border-border rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-medium mb-2">{feature.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
