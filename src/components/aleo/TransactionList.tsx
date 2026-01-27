import { ExternalLink, CheckCircle, Loader2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TransactionStatus } from "@/lib/aleo/types";

interface TransactionListProps {
  transactions: TransactionStatus[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-2xs uppercase tracking-widest text-muted-foreground">
        Transaction History
      </p>
      <div className="space-y-1">
        {transactions.map((tx, index) => (
          <div
            key={tx.tx_id}
            className="flex items-center justify-between p-2 bg-secondary/30 rounded-md"
          >
            <div className="flex items-center gap-2">
              {tx.status === "confirmed" && (
                <CheckCircle className="w-3 h-3 text-success" />
              )}
              {tx.status === "pending" && (
                <Loader2 className="w-3 h-3 animate-spin text-warning" />
              )}
              {tx.status === "failed" && (
                <XCircle className="w-3 h-3 text-destructive" />
              )}
              <span className="text-2xs font-mono">
                {tx.tx_id.slice(0, 12)}...{tx.tx_id.slice(-6)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`text-2xs ${
                  tx.status === "confirmed"
                    ? "border-success/30 text-success"
                    : tx.status === "pending"
                    ? "border-warning/30 text-warning"
                    : "border-destructive/30 text-destructive"
                }`}
              >
                {tx.status}
              </Badge>
              <a
                href={tx.explorer_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
