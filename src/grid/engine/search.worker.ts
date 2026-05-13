import type {
  WorkerMessage,
  SearchableKeys,
  IndexedRow,
  WorkerFilterDef,
} from "./types";

function createWorkerState<T>() {
  let dataset: IndexedRow<T>[] = [];

  function buildIndex(data: T[], keys: SearchableKeys<T>[]): IndexedRow<T>[] {
    return data.map((row) => {
      let searchString = "";
      for (let i = 0; i < keys.length; i++) {
        const val = row[keys[i] as keyof T];
        if (val !== null && val !== undefined) {
          searchString += String(val).toLowerCase() + " ";
        }
      }
      return { raw: row, searchText: searchString };
    });
  }

  function evaluateFilter(
    cellValue: T[keyof T],
    filter: WorkerFilterDef,
  ): boolean {
    const rawVal = cellValue;

    switch (filter.type) {
      case "text": {
        if (!filter.value) return true;
        // CRITICAL FIX: If an object accidentally routes here, ignore it instead of crashing!
        if (typeof filter.value !== "string") return true;

        return String(rawVal ?? "")
          .toLowerCase()
          .includes(filter.value.toLowerCase());
      }

      case "select": {
        if (!filter.value) return true;

        return String(rawVal ?? "") === String(filter.value);
      }

      case "multiselect": {
        if (
          !filter.value ||
          !Array.isArray(filter.value) ||
          filter.value.length === 0
        )
          return true;

        if (Array.isArray(rawVal)) {
          return rawVal.some((item) => filter.value.includes(String(item)));
        }
        return filter.value.some((fItem) =>
          String(rawVal ?? "").includes(fItem),
        );
      }

      case "range": {
        // Prevent null/empty strings from being evaluated as 0
        if (rawVal === null || rawVal === "" || rawVal === undefined)
          return false;

        const numVal = Number(rawVal);
        if (isNaN(numVal)) return false;

        if (!Array.isArray(filter.value)) return true; // Type guard
        const [min, max] = filter.value;

        if (min !== "" && numVal < Number(min)) return false;
        if (max !== "" && numVal > Number(max)) return false;
        return true;
      }

      case "comparison": {
        if (!filter.value || typeof filter.value !== "object") return true;

        const { operator, value } = filter.value[0];

        if (value === undefined || value === null || value === "") return true;

        const rowNum = Number(rawVal);
        const filterNum = Number(value);

        // Strict safety: don't let empty strings become 0
        const isNumeric =
          rawVal !== null &&
          rawVal !== "" &&
          !isNaN(rowNum) &&
          !isNaN(filterNum);

        const finalRow = isNumeric
          ? rowNum
          : String(rawVal ?? "").toLowerCase();
        const finalFilter = isNumeric ? filterNum : String(value).toLowerCase();

        switch (operator) {
          case "eq":
            return finalRow === finalFilter;
          case "neq":
            return finalRow != finalFilter;
          case "gt":
            return finalRow > finalFilter;
          case "gte":
            return finalRow >= finalFilter;
          case "lt":
            return finalRow < finalFilter;
          case "lte":
            return finalRow <= finalFilter;
          default:
            return true;
        }
      }

      case "date": {
        if (!filter.value) return true;
        const rowDateStr = String(rawVal ?? "").split("T")[0];
        return rowDateStr === filter.value;
      }

      case "checkbox": {
        if (filter.value === "indeterminate") return true;
        return Boolean(rawVal) === filter.value;
      }

      default:
        return true;
    }
  }

  return {
    handleMessage(event: MessageEvent<WorkerMessage<T>>) {
      const msg = event.data;

      if (msg.type === "init") {
        dataset = buildIndex(msg.data, msg.keys);
        self.postMessage(dataset.map((r) => r.raw));
        return;
      }

      if (msg.type === "filter") {
        const { globalFilter, columnFilters } = msg;
        const lowerGlobal = globalFilter.toLowerCase();
        const result: T[] = [];

        for (let i = 0; i < dataset.length; i++) {
          const indexedRow = dataset[i];
          let passesAll = true;

          for (let j = 0; j < columnFilters.length; j++) {
            const filter = columnFilters[j];
            const cellValue = indexedRow.raw[filter.id as keyof T];

            if (!evaluateFilter(cellValue, filter)) {
              passesAll = false;
              break;
            }
          }

          if (!passesAll) continue;

          if (lowerGlobal && !indexedRow.searchText.includes(lowerGlobal)) {
            continue;
          }

          result.push(indexedRow.raw);
        }

        self.postMessage(result);
      }
    },
  };
}

type AppRow = import("@/grid/types").StockRow;
const worker = createWorkerState<AppRow>();

self.onmessage = (event: MessageEvent<WorkerMessage<AppRow>>) => {
  worker.handleMessage(event);
};
