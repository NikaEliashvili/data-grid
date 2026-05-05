import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// --- 1. Context (State Management) ---
interface SelectContextType {
  value: string;
  onValueChange: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const SelectContext = createContext<SelectContextType | undefined>(undefined);

function useSelectContext() {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error(
      "Select components must be used within a <Select> provider",
    );
  }
  return context;
}

// --- 2. Root Component (Provider) ---
interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

export function Select({ value, onValueChange, children }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // High-performance outside click handler
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
      <div ref={containerRef} className="relative w-full">
        {children}
      </div>
    </SelectContext.Provider>
  );
}

// --- 3. Trigger Component ---
export function SelectTrigger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { isOpen, setIsOpen } = useSelectContext();

  return (
    <Button
      variant="outline"
      role="combobox"
      aria-expanded={isOpen}
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={cn("w-full justify-between font-normal", className)}
    >
      {children}
      <ChevronDown
        className={cn(
          "h-4 w-4 opacity-50 transition-transform duration-200",
          isOpen && "rotate-180",
        )}
      />
    </Button>
  );
}

// --- 4. Value Display Component ---
export function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value } = useSelectContext();
  return <span className="truncate">{value || placeholder}</span>;
}

// --- 5. Content Wrapper (Dropdown) ---
export interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "center" | "end" | "startTop" | "centerTop" | "endTop";
}

export function SelectContent({
  children,
  className,
  align = "start",
}: SelectContentProps) {
  const { isOpen } = useSelectContext();

  if (!isOpen) return null;

  // Moved vertical positioning, margins, and animations here to avoid conflicts
  const alignClasses = {
    start: "top-full left-0 mt-1 slide-in-from-top-1",
    center: "top-full left-1/2 -translate-x-1/2 mt-1 slide-in-from-top-1",
    end: "top-full right-0 mt-1 slide-in-from-top-1",
    startTop: "bottom-full left-0 mb-1 slide-in-from-bottom-1",
    centerTop:
      "bottom-full left-1/2 -translate-x-1/2 mb-1 slide-in-from-bottom-1",
    endTop: "bottom-full right-0 mb-1 slide-in-from-bottom-1",
  };

  return (
    <div
      className={cn(
        "absolute z-50 max-h-60 min-w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80",
        alignClasses[align],
        className,
      )}
    >
      {children}
    </div>
  );
}

// --- 6. Individual Item Component ---
export function SelectItem({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { value: selectedValue, onValueChange, setIsOpen } = useSelectContext();
  const isSelected = selectedValue === value;

  const handleSelect = () => {
    onValueChange(value);
    setIsOpen(false);
  };

  return (
    <div
      onClick={handleSelect}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        isSelected && "font-medium text-primary",
        className,
      )}
    >
      <span className="truncate">{children}</span>
      {isSelected && (
        <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center text-primary shrink-0">
          <Check className="h-4 w-4" />
        </span>
      )}
    </div>
  );
}
