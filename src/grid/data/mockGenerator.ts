import type { StockRow } from "@/grid/types";

const SECTORS = [
  "Technology",
  "Healthcare",
  "Finance",
  "Energy",
  "Consumer Discretionary",
  "Industrials",
  "Materials",
  "Real Estate",
  "Utilities",
  "Communication Services",
];

const EXCHANGES = ["NASDAQ", "NYSE", "LSE", "TSX", "ASX", "HKEX"];

const COUNTRIES = ["US", "UK", "CA", "AU", "HK", "JP", "DE", "FR"];

const CURRENCIES = ["USD", "GBP", "CAD", "AUD", "HKD", "JPY", "EUR"];

const SIGNALS: StockRow["signal"][] = ["buy", "hold", "sell", "neutral"];
const STATUSES: StockRow["status"][] = [
  "active",
  "active",
  "active",
  "active",
  "halted",
  "delisted",
];

const COMPANY_PREFIXES = [
  "Alpha",
  "Beta",
  "Gamma",
  "Delta",
  "Epsilon",
  "Zeta",
  "Eta",
  "Theta",
  "Iota",
  "Kappa",
  "Lambda",
  "Mu",
  "Nu",
  "Xi",
  "Omicron",
  "Pi",
  "Rho",
  "Sigma",
  "Tau",
  "Upsilon",
  "Phi",
  "Chi",
  "Psi",
  "Omega",
  "Apex",
  "Core",
  "Edge",
  "Flex",
  "Grid",
  "Hub",
  "Iris",
  "Jet",
  "Key",
  "Link",
  "Max",
  "Next",
  "Open",
  "Peak",
  "Quad",
  "Rapid",
  "Smart",
  "Top",
  "Ultra",
  "Volt",
  "Wave",
  "Xcel",
  "Yield",
  "Zen",
];

const COMPANY_SUFFIXES = [
  "Corp",
  "Inc",
  "Ltd",
  "Group",
  "Holdings",
  "Technologies",
  "Systems",
  "Ventures",
  "Capital",
  "Partners",
  "Global",
  "Industries",
];

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function pickFrom<T>(arr: T[], seed: number): T {
  return arr[Math.floor(seededRandom(seed) * arr.length)];
}

function generateSymbol(index: number): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const len = 3 + (index % 2);
  let sym = "";
  for (let i = 0; i < len; i++) {
    sym += letters[Math.floor(seededRandom(index * 17 + i) * 26)];
  }
  return sym;
}

export function generateMockData(count: number = 5000): StockRow[] {
  const rows: StockRow[] = [];
  const seenSymbols = new Set<string>();

  for (let i = 0; i < count; i++) {
    const seed = i * 31 + 7;
    let symbol = generateSymbol(i);
    while (seenSymbols.has(symbol)) symbol += String(i % 10);
    seenSymbols.add(symbol);

    const price = +(10 + seededRandom(seed) * 990).toFixed(2);
    const prevClose = +(price * (0.9 + seededRandom(seed + 1) * 0.2)).toFixed(
      2,
    );
    const change = +(price - prevClose).toFixed(2);
    const changePct = +((change / prevClose) * 100).toFixed(2);
    const open = +(prevClose * (0.99 + seededRandom(seed + 2) * 0.02)).toFixed(
      2,
    );
    const high = +(
      Math.max(price, open) *
      (1 + seededRandom(seed + 3) * 0.03)
    ).toFixed(2);
    const low = +(
      Math.min(price, open) *
      (1 - seededRandom(seed + 4) * 0.03)
    ).toFixed(2);
    const volume = Math.floor(100000 + seededRandom(seed + 5) * 50000000);
    const marketCap = +(price * (1e6 + seededRandom(seed + 6) * 1e12)).toFixed(
      0,
    );
    const peRatio = +(5 + seededRandom(seed + 7) * 95).toFixed(2);
    const eps = +(seededRandom(seed + 8) * 20 - 5).toFixed(2);
    const dividendYield = +(seededRandom(seed + 9) * 8).toFixed(2);
    const beta = +(0.2 + seededRandom(seed + 10) * 2.8).toFixed(2);
    const week52High = +(price * (1 + seededRandom(seed + 11) * 0.5)).toFixed(
      2,
    );
    const week52Low = +(price * (0.5 + seededRandom(seed + 12) * 0.45)).toFixed(
      2,
    );
    const avgVolume = Math.floor(
      volume * (0.7 + seededRandom(seed + 13) * 0.6),
    );
    const revenue = +(1e8 + seededRandom(seed + 14) * 5e11).toFixed(0);
    const netIncome = +(
      revenue *
      (seededRandom(seed + 15) * 0.3 - 0.05)
    ).toFixed(0);
    const debtToEquity = +(seededRandom(seed + 16) * 3).toFixed(2);
    const roe = +(seededRandom(seed + 17) * 40 - 5).toFixed(2);

    const exchangeIdx = Math.floor(seededRandom(seed + 18) * EXCHANGES.length);
    const countryIdx = Math.min(exchangeIdx, COUNTRIES.length - 1);

    const prefix = pickFrom(COMPANY_PREFIXES, seed + 19);
    const suffix = pickFrom(COMPANY_SUFFIXES, seed + 20);

    const isActive = i % 5 == 0;

    rows.push({
      id: `row-${i}`,
      symbol,
      name: `${prefix} ${suffix}`,
      sector: pickFrom(SECTORS, seed + 21),
      exchange: EXCHANGES[exchangeIdx],
      price,
      change,
      changePct,
      open,
      high,
      low,
      prevClose,
      volume,
      marketCap,
      peRatio,
      eps,
      dividendYield,
      beta,
      week52High,
      week52Low,
      avgVolume,
      revenue,
      netIncome,
      debtToEquity,
      roe,
      country: COUNTRIES[countryIdx],
      currency: CURRENCIES[Math.min(countryIdx, CURRENCIES.length - 1)],
      lastUpdated: new Date(
        Date.now() - Math.floor(seededRandom(seed + 22) * 3600000),
      ).toISOString(),
      status: pickFrom(STATUSES, seed + 23),
      signal: pickFrom(SIGNALS, seed + 24),
      isActive: isActive,
    });
  }

  return rows;
}

// Pre-generate once at module level for performance
export const MOCK_DATA: StockRow[] = generateMockData(100_000);
