import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { BaseFilterProps } from "../ColumnFilterCell";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  parseISO,
  isValid,
  parse, // Added parse for manual input
} from "date-fns";

// ─── Lightweight Custom Calendar Component ──────────────────────────────────
// (Unchanged from previous version)
interface LightweightCalendarProps {
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
}

function LightweightCalendar({ selected, onSelect }: LightweightCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selected || new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const weekDays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  return (
    <div className="p-3 bg-popover rounded-md border shadow-md w-64">
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm font-medium">
          {format(currentMonth, "MMMM yyyy")}
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-[10px] font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const isSelected = selected && isSameDay(day, selected);
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <Button
              key={i}
              variant="ghost"
              size="sm"
              onClick={() => onSelect(isSelected ? undefined : day)}
              className={cn(
                "h-8 w-8 p-0 font-normal text-xs transition-colors rounded-md",
                !isCurrentMonth && "text-muted-foreground opacity-50",
                isSelected &&
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              )}
            >
              {format(day, "d")}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main DateFilter Component ────────────────────────────────────────────────
// ─── Main DateFilter Component ────────────────────────────────────────────────
export function DateFilter<TData, TValue>({
  column,
  densityH,
}: BaseFilterProps<TData, TValue>) {
  const filterValue = column.getFilterValue() as string | undefined;

  // 1. Initialize local state
  const [inputValue, setInputValue] = useState(() => {
    if (filterValue) {
      const parsed = parseISO(filterValue);
      return isValid(parsed) ? format(parsed, "dd/MM/yyyy") : "";
    }
    return "";
  });

  // 2. The React-recommended way to sync props to state without useEffect
  const [prevFilterValue, setPrevFilterValue] = useState(filterValue);

  if (filterValue !== prevFilterValue) {
    setPrevFilterValue(filterValue); // Update the tracker
    if (filterValue) {
      const parsed = parseISO(filterValue);
      if (isValid(parsed)) {
        setInputValue(format(parsed, "dd/MM/yyyy"));
      }
    } else {
      setInputValue("");
    }
  }

  // Calendar object memo
  const date = useMemo(() => {
    if (!filterValue) return undefined;
    const parsed = parseISO(filterValue);
    return isValid(parsed) ? parsed : undefined;
  }, [filterValue]);

  // Triggered when calendar is clicked OR clear button is hit
  const handleSelect = (newDate: Date | undefined) => {
    column.setFilterValue(newDate ? format(newDate, "yyyy-MM-dd") : undefined);
  };

  // Handle manual typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    if (!val) {
      column.setFilterValue(undefined);
      return;
    }

    if (val.length === 10) {
      const parsedDate = parse(val, "dd/MM/yyyy", new Date());
      if (isValid(parsedDate)) {
        column.setFilterValue(format(parsedDate, "yyyy-MM-dd"));
      }
    }
  };

  return (
    <div className={cn("w-full flex items-center", densityH)}>
      <Popover>
        <div
          className={cn(
            "flex w-full items-center rounded border border-input bg-transparent transition-colors focus-within:border-solid focus-within:ring-1 focus-within:ring-ring/50 relative",
            densityH,
          )}
        >
          {/* Text Input Area */}
          <input
            type="text"
            placeholder="dd/mm/yyyy"
            value={inputValue}
            onChange={handleInputChange}
            maxLength={10}
            className="flex-1 w-full bg-transparent px-2 text-xs outline-none min-w-0 placeholder:text-muted-foreground h-full"
          />

          {/* Clear Button */}
          {inputValue && (
            <div
              role="button"
              tabIndex={0}
              className="p-1 cursor-pointer hover:bg-muted text-muted-foreground hover:text-foreground transition-colors mr-0.5 rounded-sm shrink-0"
              onClick={() => handleSelect(undefined)}
            >
              <X className="h-3 w-3" />
            </div>
          )}

          {/* Calendar Popover Trigger */}
          <PopoverTrigger className="h-full ml-auto px-2 rounded aspect-square border-input opacity-50 hover:opacity-100 w-fit hover:bg-muted shrink-0 flex items-center justify-center">
            <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 border-none shadow-none"
            align="end"
          >
            <LightweightCalendar selected={date} onSelect={handleSelect} />
          </PopoverContent>
        </div>
      </Popover>
    </div>
  );
}
