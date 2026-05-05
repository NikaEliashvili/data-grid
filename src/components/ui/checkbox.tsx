"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "checked" | "onChange"
> {
  /**
   * Radix UI compatibility: checked can be boolean or "indeterminate"
   */
  checked?: boolean | "indeterminate";
  /**
   * Radix UI compatibility: replaces standard onChange
   */
  onCheckedChange?: (checked: boolean | "indeterminate") => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, ...props }, forwardedRef) => {
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    // Browsers do not support an "indeterminate" HTML attribute.
    // It must be set directly on the DOM node via JavaScript.
    React.useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = checked === "indeterminate";
      }
    }, [checked]);

    return (
      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          ref={(node) => {
            inputRef.current = node;
            if (typeof forwardedRef === "function") forwardedRef(node);
            else if (forwardedRef) forwardedRef.current = node;
          }}
          // If indeterminate, native checked is technically false in the DOM
          checked={checked === "indeterminate" ? false : checked}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            onCheckedChange?.(e.target.checked);
          }}
          className={cn(
            "peer h-4 w-4 cursor-pointer appearance-none rounded-sm border border-primary ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            // Tailwind natively supports the indeterminate modifier!
            "checked:bg-primary checked:border-primary indeterminate:bg-primary indeterminate:border-primary",
            className,
          )}
          {...props}
        />

        {/* Render Indeterminate Dash */}
        {checked === "indeterminate" ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none absolute h-3 w-3 text-primary-foreground opacity-100 peer-disabled:opacity-50"
          >
            <line x1="5" x2="19" y1="12" y2="12" />
          </svg>
        ) : (
          /* Render Checkmark */
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none absolute h-3 w-3 text-primary-foreground opacity-0 transition-opacity peer-checked:opacity-100 peer-disabled:opacity-50"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
    );
  },
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
