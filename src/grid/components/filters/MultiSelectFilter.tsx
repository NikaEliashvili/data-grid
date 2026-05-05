import type { BaseFilterProps } from "../ColumnFilterCell";
import { cn } from "@/lib/utils";
import { Check, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export function MultiSelectFilter<TData, TValue>({
  column,
  densityH,
  meta,
}: BaseFilterProps<TData, TValue>) {
  const options = meta.filterOptions || [];
  const selectedValues = new Set((column.getFilterValue() as string[]) || []);

  const title = column.columnDef.header as string | undefined;

  return (
    <div
      className={cn("w-full px-1 flex items-center justify-center", densityH)}
    >
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-full w-full justify-start text-xs font-normal border-dashed border-input bg-transparent hover:bg-muted",
              densityH,
            )}
          >
            <PlusCircle className="mr-2 h-3.5 w-3.5 opacity-50" />
            <span className="truncate flex-1 text-left text-muted-foreground">
              Select...
            </span>
            {selectedValues?.size > 0 && (
              <>
                <div className="ml-2 border-l border-border h-3 w-px shrink-0" />
                <Badge
                  variant="secondary"
                  className="ml-2 rounded-sm px-1 font-normal text-[10px] shrink-0"
                >
                  {selectedValues.size}
                </Badge>
              </>
            )}
          </Button>
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
                  const isSelected = selectedValues.has(
                    option.value.toString(),
                  );
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value.toString()}
                      onSelect={() => {
                        const newSelectedValues = new Set(selectedValues);
                        const valString = option.value.toString();
                        if (isSelected) {
                          newSelectedValues.delete(valString);
                        } else {
                          newSelectedValues.add(valString);
                        }

                        const filterValues = Array.from(newSelectedValues);
                        column.setFilterValue(
                          filterValues.length ? filterValues : undefined,
                        );
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
                      value={column.getFilterValue.toString()}
                      onSelect={() => column.setFilterValue(undefined)}
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
