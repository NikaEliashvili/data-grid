import type { StyleCondition, CellPrimitive } from "@/grid/types"

export function evaluateConditions(
  value: CellPrimitive,
  conditions: StyleCondition[]
): { className: string; style?: React.CSSProperties } {
  for (const cond of conditions) {
    if (matchCondition(value, cond)) {
      return { className: cond.className, style: cond.style }
    }
  }
  return { className: "" }
}

function matchCondition(value: CellPrimitive, cond: StyleCondition): boolean {
  if (value == null) return false

  const numVal = Number(value)
  const strVal = String(value).toLowerCase()
  const condVal = cond.value
  const numCond = Number(condVal)
  const strCond = String(condVal).toLowerCase()

  switch (cond.operator) {
    case "gt":   return numVal > numCond
    case "gte":  return numVal >= numCond
    case "lt":   return numVal < numCond
    case "lte":  return numVal <= numCond
    case "eq":   return value === condVal
    case "neq":  return value !== condVal
    case "contains":    return strVal.includes(strCond)
    case "startsWith":  return strVal.startsWith(strCond)
    case "endsWith":    return strVal.endsWith(strCond)
    case "between": {
      if (cond.value2 == null) return false
      return numVal >= numCond && numVal <= Number(cond.value2)
    }
    default: return false
  }
}
