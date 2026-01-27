import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface VolatilityChartProps {
  data: { date: string; volatility: number }[];
}

export const VolatilityChart = ({ data }: VolatilityChartProps) => {
  const maxVolatility = Math.max(...data.map((d) => d.volatility), 5);
  const yAxisMax = Math.ceil(maxVolatility / 5) * 5 + 5;

  return (
    <Card className="p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-medium">Volatility Over Time</h2>
          <p className="text-2xs text-muted-foreground mt-1">
            Rolling volatility (%)
          </p>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis
              tick={{ fontSize: 10 }}
              stroke="hsl(var(--muted-foreground))"
              domain={[0, yAxisMax]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                fontSize: "12px",
              }}
              labelStyle={{ fontWeight: 500 }}
              formatter={(value: number) => [`${value.toFixed(2)}%`, "Volatility"]}
            />
            <Line
              type="monotone"
              dataKey="volatility"
              stroke="hsl(var(--foreground))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--foreground))", strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
