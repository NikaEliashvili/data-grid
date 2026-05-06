import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

const DropdownContext = React.createContext<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
} | null>(null);

function useDropdown() {
  const context = React.useContext(DropdownContext);
  if (!context) {
    throw new Error("Dropdown components must be wrapped in <DropdownMenu>");
  }
  return context;
}

// 2. The Root Wrapper (Handles State & Click-Outside)
export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isOpen) return;

    // Mousedown is faster than click, preventing event bubbling delays
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen }}>
      <div ref={menuRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

type DropdownMenuTriggerProps = React.ComponentPropsWithoutRef<typeof Button>;

export const DropdownMenuTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  DropdownMenuTriggerProps
>(({ className, children, onClick, ...props }, ref) => {
  const { isOpen, setIsOpen } = useDropdown();

  return (
    <Button
      ref={ref}
      type="button"
      onClick={(e) => {
        setIsOpen(!isOpen);
        onClick?.(e);
      }}
      className={cn("focus:outline-none", className)}
      {...props}
    >
      {children}
    </Button>
  );
});

DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

// 4. The Content (Pure CSS Absolute Positioning)
const alignStyles = {
  start: "left-0",
  center: "left-1/2 -translate-x-1/2",
  end: "right-0",
} as const;

// 4. The Content (Pure CSS Absolute Positioning with Shadcn Alignment)
export const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { align?: keyof typeof alignStyles }
>(({ className, align = "center", children, ...props }, ref) => {
  const { isOpen } = useDropdown();

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "absolute top-full z-50 mt-1 min-w-32 overflow-hidden rounded-md border border-border bg-background p-1 text-foreground shadow-md animate-in fade-in-0 zoom-in-95 duration-100",
        alignStyles[align],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
DropdownMenuContent.displayName = "DropdownMenuContent";

// 5. The Item (Auto-closes the menu on click)
export const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { disabled?: boolean }
>(({ className, disabled, onClick, ...props }, ref) => {
  const { setIsOpen } = useDropdown();

  return (
    <div
      ref={ref}
      onClick={(e) => {
        if (disabled) return;
        onClick?.(e);
        setIsOpen(false); // Automatically close on selection
      }}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
        disabled
          ? "pointer-events-none opacity-50"
          : "hover:bg-accent hover:text-accent-foreground cursor-pointer",
        className,
      )}
      {...props}
    />
  );
});
DropdownMenuItem.displayName = "DropdownMenuItem";

// 6. Utility Components (Label & Separator)
export const DropdownMenuLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
));
DropdownMenuLabel.displayName = "DropdownMenuLabel";

export const DropdownMenuCheckboxItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    autoClose?: boolean;
  }
>(
  (
    {
      className,
      children,
      checked,
      onCheckedChange,
      disabled,
      onClick,
      autoClose = true,
      ...props
    },
    ref,
  ) => {
    const { setIsOpen } = useDropdown();

    return (
      <div
        ref={ref}
        onClick={(e) => {
          if (disabled) return;
          if (autoClose) setIsOpen(false);
          // Trigger the custom change handler
          onCheckedChange?.(!checked);
          onClick?.(e);
        }}
        className={cn(
          "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors",
          disabled
            ? "pointer-events-none opacity-50"
            : "hover:bg-accent hover:text-accent-foreground cursor-pointer",
          className,
        )}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {/* Render the checkmark only when checked is true */}
          {checked && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          )}
        </span>
        {children}
      </div>
    );
  },
);
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";

export const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";
