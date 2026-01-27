import { motion } from "framer-motion";
import { Upload, Cpu, FileCheck, Download } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Data",
    description: "Upload your CSV with historical returns or portfolio weights. Data stays on your device.",
  },
  {
    number: "02",
    icon: Cpu,
    title: "Generate Proof",
    description: "Aleo SDK computes volatility and risk locally, generating a zero-knowledge proof.",
  },
  {
    number: "03",
    icon: FileCheck,
    title: "Verify Results",
    description: "Anyone can verify your proof on-chain without accessing your private data.",
  },
  {
    number: "04",
    icon: Download,
    title: "Export Report",
    description: "Download your verified risk report and proof for compliance or sharing.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-2xs uppercase tracking-widest text-muted-foreground mb-3">
            Simple Workflow
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">
            How AleoRisk Works
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              <div className="text-5xl font-display font-semibold text-border mb-4">
                {step.number}
              </div>
              <div className="flex items-center gap-3 mb-3">
                <step.icon className="w-5 h-5" />
                <h3 className="text-sm font-medium">{step.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {step.description}
              </p>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-border -translate-x-1/2" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
