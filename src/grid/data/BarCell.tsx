import { cn } from "@/lib/utils";
import { fmt } from "./utils";

export function BarCell({
  value,
  max,
  colorClass,
}: {
  value: number;
  max: number;
  colorClass: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="flex items-center gap-2 w-full">
      <span className="tabular-nums text-xs w-12 shrink-0">
        {fmt.compact(value)}
      </span>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full", colorClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
