import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import { fmt } from "./utils";

export function ChangeCell({ change, pct }: { change: number; pct: number }) {
  const positive = change >= 0;
  return (
    <div
      className={cn(
        "flex items-center gap-1 font-medium tabular-nums",
        positive
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-red-600 dark:text-red-400",
      )}
    >
      {positive ? (
        <TrendingUp className="size-3.5 shrink-0" />
      ) : (
        <TrendingDown className="size-3.5 shrink-0" />
      )}
      <span>
        {positive ? "+" : ""}
        {fmt.currency(change)}
      </span>
      <span className="text-xs opacity-75">({fmt.percent(pct)})</span>
    </div>
  );
}
