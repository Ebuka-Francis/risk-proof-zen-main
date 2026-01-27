import { motion } from "framer-motion";

interface RiskGaugeProps {
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  volatility: number;
}

export const RiskGauge = ({ riskLevel, volatility }: RiskGaugeProps) => {
  // Calculate needle rotation based on volatility (0-30% range mapped to -90 to 90 degrees)
  const maxVolatility = 30;
  const clampedVolatility = Math.min(volatility, maxVolatility);
  const rotation = (clampedVolatility / maxVolatility) * 180 - 90;

  const getRiskColor = (level: string) => {
    switch (level) {
      case "LOW":
        return "hsl(var(--success))";
      case "MEDIUM":
        return "hsl(var(--warning))";
      case "HIGH":
        return "hsl(var(--destructive))";
      default:
        return "hsl(var(--foreground))";
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-24 overflow-hidden">
        {/* Gauge background arc */}
        <svg
          viewBox="0 0 200 100"
          className="w-full h-full"
          style={{ transform: "rotate(0deg)" }}
        >
          {/* Background arc segments */}
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--success))" />
              <stop offset="50%" stopColor="hsl(var(--warning))" />
              <stop offset="100%" stopColor="hsl(var(--destructive))" />
            </linearGradient>
          </defs>

          {/* Outer arc background */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Colored arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Tick marks */}
          {[0, 30, 60, 90, 120, 150, 180].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = 100 + 70 * Math.cos(Math.PI - rad);
            const y1 = 100 - 70 * Math.sin(Math.PI - rad);
            const x2 = 100 + 60 * Math.cos(Math.PI - rad);
            const y2 = 100 - 60 * Math.sin(Math.PI - rad);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="1"
              />
            );
          })}

          {/* Labels */}
          <text
            x="30"
            y="95"
            fontSize="8"
            fill="hsl(var(--muted-foreground))"
            textAnchor="middle"
          >
            0%
          </text>
          <text
            x="100"
            y="25"
            fontSize="8"
            fill="hsl(var(--muted-foreground))"
            textAnchor="middle"
          >
            15%
          </text>
          <text
            x="170"
            y="95"
            fontSize="8"
            fill="hsl(var(--muted-foreground))"
            textAnchor="middle"
          >
            30%
          </text>
        </svg>

        {/* Needle */}
        <motion.div
          className="absolute bottom-0 left-1/2 origin-bottom"
          style={{
            width: "2px",
            height: "70px",
            marginLeft: "-1px",
          }}
          initial={{ rotate: -90 }}
          animate={{ rotate: rotation }}
          transition={{
            type: "spring",
            stiffness: 60,
            damping: 15,
            delay: 0.3,
          }}
        >
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(to top, ${getRiskColor(riskLevel)}, transparent)`,
            }}
          />
          <div
            className="absolute bottom-0 left-1/2 w-3 h-3 rounded-full -translate-x-1/2 translate-y-1/2"
            style={{ backgroundColor: getRiskColor(riskLevel) }}
          />
        </motion.div>

        {/* Center dot */}
        <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-foreground rounded-full -translate-x-1/2 translate-y-1/2" />
      </div>

      {/* Risk Level Label */}
      <motion.div
        className="mt-4 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <p
          className="text-lg font-semibold"
          style={{ color: getRiskColor(riskLevel) }}
        >
          {riskLevel} RISK
        </p>
        <p className="text-2xs text-muted-foreground mt-1">
          {volatility.toFixed(1)}% volatility
        </p>
      </motion.div>
    </div>
  );
};
