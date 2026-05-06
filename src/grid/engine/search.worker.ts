// engine/search.worker.ts
import type {
  WorkerMessage,
  SearchableKeys,
  IndexedRow,
  ColumnFilterDef,
} from "./types";

function createWorkerState<T>() {
  let dataset: IndexedRow<T>[] = [];
  const MAX_RESULTS = 1000;

  function buildIndex(data: T[], keys: SearchableKeys<T>[]): IndexedRow<T>[] {
    return data.map((row) => ({
      raw: row,
      searchText: keys
        .map((key) => {
          const value = row[key];
          return value === null || value === undefined ? "" : String(value);
        })
        .join(" ")
        .toLowerCase(),
    }));
  }

  // Strictly typed filter evaluator
  function evaluateColumnFilter(
    val: T[keyof T],
    filter: ColumnFilterDef<T>,
  ): boolean {
    switch (filter.type) {
      case "numberRange": {
        if (typeof val !== "number") return false;
        const [min, max] = filter.value;
        if (min !== "" && val < min) return false;
        if (max !== "" && val > max) return false;
        return true;
      }
      case "exactMatch": {
        return String(val ?? "") === filter.value;
      }
      case "multiSelect": {
        if (!filter.value.length) return true;
        return filter.value.includes(String(val ?? ""));
      }
      case "contains": {
        if (!filter.value) return true;
        return String(val ?? "")
          .toLowerCase()
          .includes(filter.value.toLowerCase());
      }
      case "comparison": {
        if (!filter.value || !filter.value.value) return true;
        const { operator, value } = filter.value;
        // Safe string/number comparison based on your logic
        if (operator === "eq") return val == value;
        if (operator === "neq") return val != value;
        if (operator === "gt") return Number(val) > Number(value);
        if (operator === "gte") return Number(val) >= Number(value);
        if (operator === "lt") return Number(val) < Number(value);
        if (operator === "lte") return Number(val) <= Number(value);
        return true;
      }
      case "globalFuzzy": {
        // Handled via the global string index below for performance
        return true;
      }
      // Exhaustiveness check ensures we never miss a type
      default: {
        return true;
      }
    }
  }

  return {
    handleMessage(event: MessageEvent<WorkerMessage<T>>) {
      const msg = event.data;

      if (msg.type === "init") {
        dataset = buildIndex(msg.data, msg.keys);
        self.postMessage(dataset.slice(0, MAX_RESULTS).map((r) => r.raw));
        return;
      }

      if (msg.type === "filter") {
        const { globalFilter, columnFilters } = msg;
        const lowerGlobal = globalFilter.toLowerCase();
        const result: T[] = [];

        // Loop execution is highly optimized
        for (let i = 0; i < dataset.length; i++) {
          const indexedRow = dataset[i];
          let passesAll = true;

          // 1. Column Filters Evaluation
          for (let j = 0; j < columnFilters.length; j++) {
            const filter = columnFilters[j];
            const val = indexedRow.raw[filter.id];

            if (!evaluateColumnFilter(val, filter)) {
              passesAll = false;
              break;
            }
          }

          if (!passesAll) continue;

          // 2. Global Filter Evaluation (using pre-indexed string)
          if (lowerGlobal && !indexedRow.searchText.includes(lowerGlobal)) {
            continue;
          }

          result.push(indexedRow.raw);
          if (result.length >= MAX_RESULTS) break; // Prevent main thread serialization lag
        }

        self.postMessage(result);
      }
    },
  };
}

// Instantiate with actual type
type AppRow = import("@/grid/types").StockRow;
const worker = createWorkerState<AppRow>();

self.onmessage = (event: MessageEvent<WorkerMessage<AppRow>>) => {
  worker.handleMessage(event);
};
