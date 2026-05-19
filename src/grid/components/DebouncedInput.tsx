import { useEffect, useState, type InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type SupportedValue = string | number;

interface DebouncedInputProps<T extends SupportedValue> extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> {
  value: T;
  onChange: (value: T) => void;
  debounce: number;
  parser?: (value: string) => T;
}

export function DebouncedInput<T extends SupportedValue>({
  value: initialValue,
  onChange,
  debounce,
  parser,
  ...props
}: DebouncedInputProps<T>) {
  const [localValue, setLocalValue] = useState<string>(
    String(initialValue ?? ""),
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const parsedValue = parser ? parser(localValue) : (localValue as T);

      onChange(parsedValue);
    }, debounce);

    return () => {
      window.clearTimeout(timer);
    };
  }, [localValue, debounce, onChange, parser]);

  useEffect(() => {
    const syncValue = () => {
      setLocalValue(String(initialValue ?? ""));
    };
    syncValue();
  }, [initialValue]);

  return (
    <div className="relative flex-1 min-w-50 max-w-xs">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
      <Input
        {...props}
        placeholder="Search all columns..."
        className="pl-8 h-8 text-sm"
        value={localValue}
        onChange={(event) => {
          setLocalValue(event.target.value);
        }}
      />
    </div>
  );
}
