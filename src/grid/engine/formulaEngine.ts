import type { CellPrimitive, FormulaDefinition } from "@/grid/types"

export class FormulaEngine<TData extends Record<string, CellPrimitive>> {
  private formulas: Map<string, FormulaDefinition<TData>["fn"]> = new Map()

  register(definition: FormulaDefinition<TData>): void {
    this.formulas.set(definition.columnId, definition.fn)
  }

  compute(columnId: string, row: TData, allRows: TData[]): CellPrimitive {
    const fn = this.formulas.get(columnId)
    if (!fn) return null
    try {
      return fn(row, allRows)
    } catch {
      return "#ERR"
    }
  }

  hasFormula(columnId: string): boolean {
    return this.formulas.has(columnId)
  }

  computeAll(row: TData, allRows: TData[]): Partial<TData> {
    const result: Record<string, CellPrimitive> = {}
    for (const [columnId, fn] of this.formulas) {
      try {
        result[columnId] = fn(row, allRows)
      } catch {
        result[columnId] = "#ERR"
      }
    }
    return result as Partial<TData>
  }

  clear(): void {
    this.formulas.clear()
  }
}

// ─── Built-in formula helpers ─────────────────────────────────────────────────
export const formulaHelpers = {
  sum: <T extends Record<string, CellPrimitive>>(rows: T[], key: keyof T): number =>
    rows.reduce((acc, r) => acc + (Number(r[key]) || 0), 0),

  avg: <T extends Record<string, CellPrimitive>>(rows: T[], key: keyof T): number => {
    if (!rows.length) return 0
    return formulaHelpers.sum(rows, key) / rows.length
  },

  min: <T extends Record<string, CellPrimitive>>(rows: T[], key: keyof T): number =>
    Math.min(...rows.map((r) => Number(r[key]) || 0)),

  max: <T extends Record<string, CellPrimitive>>(rows: T[], key: keyof T): number =>
    Math.max(...rows.map((r) => Number(r[key]) || 0)),

  count: <T>(rows: T[]): number => rows.length,
} as const
