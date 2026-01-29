import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | React.ReactNode;
  description: string;
  icon: LucideIcon;
}

export const MetricCard = ({
  label,
  value,
  description,
  icon: Icon,
}: MetricCardProps) => {
  return (
    <Card className="p-6 border border-border">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-2xs uppercase tracking-widest text-muted-foreground mb-1">
            {label}
          </p>
          <div className="font-display text-3xl font-semibold">{value}</div>
          <p className="text-2xs text-muted-foreground mt-1">{description}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
};
