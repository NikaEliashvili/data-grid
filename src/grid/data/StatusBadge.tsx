import { cn } from "@/lib/utils";
import type { StockRow } from "../types";

export function StatusBadge({ value }: { value: StockRow["status"] }) {
  const map = {
    active:
      "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    halted:
      "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    delisted: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        map[value],
      )}
    >
      {value.charAt(0).toUpperCase() + value.slice(1)}
    </span>
  );
}
