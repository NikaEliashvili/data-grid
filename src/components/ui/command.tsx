"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CommandContextType {
  search: string;
  setSearch: (s: string) => void;
  matchCount: number;
  registerMatch: (id: string, isMatch: boolean) => void;
}

const CommandContext = React.createContext<CommandContextType | null>(null);

export function Command({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [search, setSearch] = React.useState("");
  const [matches, setMatches] = React.useState<Record<string, boolean>>({});

  const registerMatch = React.useCallback((id: string, isMatch: boolean) => {
    setMatches((prev) => {
      if (prev[id] === isMatch) return prev;
      return { ...prev, [id]: isMatch };
    });
  }, []);

  const matchCount = Object.values(matches).filter(Boolean).length;

  const value = React.useMemo(
    () => ({
      search,
      setSearch,
      matchCount,
      registerMatch,
    }),
    [search, matchCount, registerMatch],
  );

  return (
    <CommandContext.Provider value={value}>
      <div
        className={cn(
          "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
          className,
        )}
      >
        {children}
      </div>
    </CommandContext.Provider>
  );
}

export function CommandInput({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) {
  const context = React.useContext(CommandContext);
  if (!context) throw new Error("CommandInput must be used within Command");

  return (
    <div className="flex items-center border-b px-3" cmnd-input-wrapper="">
      <input
        className={cn(
          "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        placeholder={placeholder}
        value={context.search}
        onChange={(e) => context.setSearch(e.target.value)}
      />
    </div>
  );
}

export function CommandList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-h-75 overflow-y-auto overflow-x-hidden p-1",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CommandEmpty({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const context = React.useContext(CommandContext);
  if (!context) throw new Error("CommandEmpty must be used within Command");

  if (context.matchCount > 0 || !context.search) return null;

  return (
    <div className={cn("py-6 text-center text-sm", className)}>{children}</div>
  );
}

export function CommandGroup({
  children,
  heading,
  className,
}: {
  children: React.ReactNode;
  heading?: string;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden p-1 text-foreground", className)}>
      {heading && (
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          {heading}
        </div>
      )}
      {children}
    </div>
  );
}

interface CommandItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  onSelect?: () => void;
  disabled?: boolean;
}

export function CommandItem({
  children,
  onSelect,
  className,
  value,
  disabled,
  ...props
}: CommandItemProps) {
  const context = React.useContext(CommandContext);
  if (!context) throw new Error("CommandItem must be used within Command");

  const id = React.useId();
  const isMatch = value.toLowerCase().includes(context.search.toLowerCase());

  React.useEffect(() => {
    context.registerMatch(id, isMatch);
    return () => context.registerMatch(id, false);
  }, [id, isMatch, context]);

  if (!isMatch) return null;

  return (
    <div
      {...props}
      onClick={() => {
        if (!disabled) onSelect?.();
      }}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CommandSeparator({ className }: { className?: string }) {
  return <div className={cn("-mx-1 my-1 h-px bg-muted", className)} />;
}
