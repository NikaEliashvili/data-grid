import type { WorkerMessage, WorkerFilterDef } from "./types";

// Extended message type internally to handle queryId
type IncomingMessage<T> = WorkerMessage<T> & { queryId?: number };

function createWorkerState<T>() {
  // Parallel arrays drastically reduce memory compared to wrapper objects
  let rawData: T[] = [];
  let searchIndex: string[] = [];

  function evaluateFilter(
    cellValue: T[keyof T],
    filter: WorkerFilterDef,
  ): boolean {
    const rawVal = cellValue;

    switch (filter.type) {
      case "text": {
        if (!filter.value) return true;
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
        if (rawVal === null || rawVal === "" || rawVal === undefined)
          return false;
        const numVal = Number(rawVal);
        if (isNaN(numVal)) return false;
        if (!Array.isArray(filter.value)) return true;
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
    handleMessage(event: MessageEvent<IncomingMessage<T>>) {
      const msg = event.data;

      if (msg.type === "init") {
        rawData = msg.data;
        searchIndex = new Array(rawData.length);

        // Pre-compute index strings lazily into a flat array
        for (let i = 0; i < rawData.length; i++) {
          let searchString = "";
          for (let j = 0; j < msg.keys.length; j++) {
            const val = rawData[i][msg.keys[j] as keyof T];
            if (val !== null && val !== undefined) {
              searchString += String(val).toLowerCase() + " ";
            }
          }
          searchIndex[i] = searchString;
        }

        // Do NOT send the massive payload back to the main thread
        self.postMessage({ type: "init_done" });
        return;
      }

      if (msg.type === "filter") {
        const { globalFilter, columnFilters, queryId } = msg;
        const lowerGlobal = globalFilter ? globalFilter.toLowerCase() : "";
        const result: T[] = [];

        // Loop over the raw data chunk
        for (let i = 0; i < rawData.length; i++) {
          let passesAll = true;
          const row = rawData[i];

          // 1. Evaluate Column Filters first (usually faster to reject)
          for (let j = 0; j < columnFilters.length; j++) {
            const filter = columnFilters[j];
            const cellValue = row[filter.id as keyof T];

            if (!evaluateFilter(cellValue, filter)) {
              passesAll = false;
              break;
            }
          }

          if (!passesAll) continue;

          // 2. Evaluate Global Filter string search
          if (lowerGlobal && !searchIndex[i].includes(lowerGlobal)) {
            continue;
          }

          result.push(row);
        }

        // Return chunk results tagged with the specific queryId
        self.postMessage({
          type: "filter_result",
          queryId,
          data: result,
        });
      }
    },
  };
}

type AppRow = import("@/grid/types").StockRow;
const worker = createWorkerState<AppRow>();

self.onmessage = (event: MessageEvent<IncomingMessage<AppRow>>) => {
  worker.handleMessage(event);
};
