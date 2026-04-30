import { useMemo } from "react";
import { DataGrid } from "@/grid/components/DataGrid";
import { MOCK_DATA } from "@/grid/data/mockGenerator";
import { STOCK_COLUMNS } from "@/grid/data/stockColumns";
import { ModeToggle } from "@/components/mode-toggle";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChartBar as BarChart2 } from "lucide-react";
import type { GridConfig, StockRow } from "@/grid/types";

export function App() {
  const config = useMemo<GridConfig<StockRow>>(
    () => ({
      columns: STOCK_COLUMNS,
      data: MOCK_DATA,
      enableRowSelection: true,
      enableGlobalFilter: true,
      enableGrouping: true,
      enablePagination: true,
      pageSize: 50,
      rowIdKey: "id",
    }),
    [],
  );

  return (
    <div className="flex flex-col min-h-svh bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b bg-card shrink-0">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
            <BarChart2 className="size-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-none">DataGrid Pro</h1>
            <p className="text-xs text-muted-foreground leading-none mt-0.5">
              Complex Data Grid
            </p>
          </div>
        </div>

        <Separator orientation="vertical" className="h-5" />

        <div className="flex items-center gap-1.5">
          <Badge
            variant="outline"
            className="text-xs font-normal text-muted-foreground"
          >
            Complex Data Grid built by TanStack Table & Zustand
          </Badge>
        </div>

        <div className="flex-1" />

        <ModeToggle />
      </header>

      {/* Grid fills remaining viewport */}
      <main className="flex-1 p-4 min-h-0 flex flex-col overflow-hidden">
        <DataGrid config={config} />
      </main>
    </div>
  );
}

export default App;
