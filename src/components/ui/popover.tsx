"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

const PopoverContext = React.createContext<{
  isOpen: boolean;
  setIsOpen: (o: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
} | null>(null);

export function Popover({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  return (
    <PopoverContext.Provider value={{ isOpen, setIsOpen, triggerRef }}>
      <div className="relative inline-block w-full">{children}</div>
    </PopoverContext.Provider>
  );
}

export const PopoverTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, onClick, ...props }, ref) => {
  const { isOpen, setIsOpen, triggerRef } = React.useContext(PopoverContext)!;
  return (
    <button
      ref={(node) => {
        triggerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      type="button"
      onClick={(e) => {
        setIsOpen(!isOpen);
        onClick?.(e);
      }}
      className={cn("focus:outline-none", className)}
      {...props}
    />
  );
});

export const PopoverContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { align?: "start" | "center" | "end" }
>(({ className, align = "start", ...props }, ref) => {
  const { isOpen, setIsOpen, triggerRef } = React.useContext(PopoverContext)!;
  const [coords, setCoords] = React.useState<{
    top: number;
    left: number;
    transform: string;
  } | null>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const top = rect.bottom + window.scrollY + 4;
      const left =
        align === "start"
          ? rect.left
          : align === "end"
            ? rect.right
            : rect.left + rect.width / 2;
      const transform =
        align === "center"
          ? "translateX(-50%)"
          : align === "end"
            ? "translateX(-100%)"
            : "";
      setCoords({ top, left: left + window.scrollX, transform });
    }
  }, [isOpen, align, triggerRef]);

  React.useEffect(() => {
    if (!isOpen) return;

    // Explicitly typing the event as a MouseEvent
    const handleOutsideClick = (e: MouseEvent): void => {
      const target = e.target as Node; // Casting target to Node for .contains()

      if (
        triggerRef.current &&
        contentRef.current &&
        !triggerRef.current.contains(target) &&
        !contentRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    // Naming the scroll function so it can be correctly removed during cleanup
    const handleScroll = (): void => setIsOpen(false);

    window.addEventListener("mousedown", handleOutsideClick);

    // 'capture: true' is essential to catch scroll events from any nested
    // scrolling container (like your Data Grid's body)
    window.addEventListener("scroll", handleScroll, {
      capture: true,
      passive: true,
    });

    return () => {
      window.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("scroll", handleScroll, { capture: true });
    };
  }, [isOpen, setIsOpen, triggerRef]);

  if (!isOpen) return null;
  return createPortal(
    <div
      ref={(node) => {
        contentRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      style={{
        position: "absolute",
        top: coords?.top,
        left: coords?.left,
        transform: coords?.transform,
        visibility: coords ? "visible" : "hidden",
      }}
      className={cn(
        "z-50 rounded-md border border-border bg-background p-1 shadow-md animate-in fade-in-0 zoom-in-95 duration-75",
        className,
      )}
      {...props}
    />,
    document.body,
  );
});
