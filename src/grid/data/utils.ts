export const fmt = {
  currency: (v: number, cur = "USD") =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: cur,
      minimumFractionDigits: 2,
    }).format(v),
  number: (v: number, decimals = 2) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(v),
  compact: (v: number) =>
    new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(v),
  percent: (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`,
  date: (v: string) => new Date(v).toLocaleString(),
};
