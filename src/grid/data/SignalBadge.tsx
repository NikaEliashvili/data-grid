import { cn } from "@/lib/utils";
import type { StockRow } from "../types";

export function SignalBadge({ value }: { value: StockRow["signal"] }) {
  const map = {
    buy: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    sell: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
    hold: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    neutral: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        map[value],
      )}
    >
      {value.toUpperCase()}
    </span>
  );
}
