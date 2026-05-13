import { useState, useEffect, useMemo } from "react";
import type { BaseFilterProps } from "../ColumnFilterCell";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useDebounce } from "@/grid/hooks/useDebounce";

export function MultiSelectFilter<TData, TValue>({
  column,
  densityH,
  meta,
}: BaseFilterProps<TData, TValue>) {
  const rawTableValue = column.getFilterValue() as string[] | undefined;
  const [prevRawTableValue, setPrevRawTableValue] = useState(rawTableValue);
  const options = meta.filterOptions || [];
  const tableValue = useMemo(
    () => (column.getFilterValue() as string[]) || [],
    [column],
  );

  // Local state for checkboxes
  const [selectedValues, setSelectedValues] = useState<Set<string>>(
    new Set(tableValue),
  );

  // Debounce the entire Set
  const debouncedSelected = useDebounce(selectedValues, 300);

  if (rawTableValue !== prevRawTableValue) {
    setPrevRawTableValue(rawTableValue);
    if (!rawTableValue) {
      setSelectedValues(new Set());
    }
  }

  // Push to table
  useEffect(() => {
    const arrayValues = Array.from(debouncedSelected);
    // Deep comparison skip
    if (JSON.stringify(arrayValues) !== JSON.stringify(tableValue)) {
      column.setFilterValue(arrayValues.length ? arrayValues : undefined);
    }
  }, [debouncedSelected, column, tableValue]);

  const title = column.columnDef.header as string | undefined;

  return (
    <div className={cn("w-full flex items-center justify-center", densityH)}>
      <Popover>
        <PopoverTrigger
          className={cn(
            "h-full w-full justify-start text-xs font-normal bg-transparent hover:bg-muted",
            densityH,
          )}
          hasArrow
        >
          <span className="truncate flex-1 text-left text-muted-foreground">
            Select...
          </span>
          {selectedValues?.size > 0 && (
            <>
              <div className="ml-2 border-l border-border h-3 w-px shrink-0" />
              <Badge
                variant="secondary"
                className="mx-1 rounded-full aspect-square size-4 flex items-center justify-center px-1 font-normal text-[10px] shrink-0"
              >
                {selectedValues.size}
              </Badge>
            </>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-50 p-0" align="start">
          <Command>
            <CommandInput
              placeholder={title ? `Search ${title}...` : "Search options..."}
            />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const valString = option.value.toString();
                  const isSelected = selectedValues.has(valString);

                  return (
                    <CommandItem
                      key={option.value}
                      value={valString}
                      onSelect={() => {
                        // Mutate local state instantly
                        const newSet = new Set(selectedValues);
                        if (isSelected) {
                          newSet.delete(valString);
                        } else {
                          newSet.add(valString);
                        }
                        setSelectedValues(newSet);
                      }}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible",
                        )}
                      >
                        <Check className={cn("h-4 w-4")} />
                      </div>
                      <span className="text-xs">{option.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              {selectedValues.size > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      value="clear"
                      onSelect={() => setSelectedValues(new Set())}
                      className="justify-center text-center text-xs"
                    >
                      Clear filters
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
