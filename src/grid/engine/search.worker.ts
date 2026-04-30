type Primitive = string | number | boolean | null | undefined;

// restrict searchable fields to safe primitive values
type SearchableKeys<T> = {
  [K in keyof T]: T[K] extends Primitive ? K : never;
}[keyof T];

type IndexedRow<T> = {
  raw: T;
  searchText: string;
};

type InitMessage<T> = {
  type: "init";
  data: T[];
  keys: SearchableKeys<T>[];
};

type SearchMessage = {
  type: "search";
  searchTerm: string;
};

type WorkerMessage<T> = InitMessage<T> | SearchMessage;

// internal state (generic via function scope trick)
function createWorkerState<T>() {
  let dataset: IndexedRow<T>[] = [];
  let prevSearch = "";
  let prevResult: IndexedRow<T>[] = [];

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

  function filterData(source: IndexedRow<T>[], term: string) {
    const lower = term.toLowerCase();
    const result: IndexedRow<T>[] = [];

    for (let i = 0; i < source.length; i++) {
      if (source[i].searchText.includes(lower)) {
        result.push(source[i]);
        if (result.length >= MAX_RESULTS) break;
      }
    }

    return result;
  }

  return {
    handleMessage(event: MessageEvent<WorkerMessage<T>>) {
      const { type } = event.data;

      if (type === "init") {
        const { data, keys } = event.data;

        dataset = buildIndex(data, keys);
        prevSearch = "";
        prevResult = dataset;

        return;
      }

      if (type === "search") {
        const { searchTerm } = event.data;

        if (!searchTerm) {
          prevSearch = "";
          prevResult = dataset;

          self.postMessage(dataset.slice(0, MAX_RESULTS).map((r) => r.raw));
          return;
        }

        let source: IndexedRow<T>[];

        // incremental filtering
        if (searchTerm.startsWith(prevSearch)) {
          source = prevResult;
        } else {
          source = dataset;
        }

        const result = filterData(source, searchTerm);

        prevSearch = searchTerm;
        prevResult = result;

        self.postMessage(result.map((r) => r.raw));
      }
    },
  };
}

// 👇 instantiate with your actual type
// (this keeps the worker generic internally but concrete at usage)
type AppRow = import("@/grid/types").StockRow;

const worker = createWorkerState<AppRow>();

self.onmessage = (event: MessageEvent<WorkerMessage<AppRow>>) => {
  worker.handleMessage(event);
};
