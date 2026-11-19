import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "@/lib/utils/cn";

interface SeparatorProps {
  orientation?: "horizontal" | "vertical";
  className?: string;
}

function Separator({ orientation = "horizontal", className }: SeparatorProps) {
  if (orientation === "horizontal") {
    return (
      <SeparatorPrimitive.Root
        className={cn("h-px w-full bg-zinc-200 dark:bg-zinc-800", className)}
        decorative
      />
    );
  }
  return (
    <SeparatorPrimitive.Root
      className={cn("w-px h-full bg-zinc-200 dark:bg-zinc-800", className)}
      decorative
    />
  );
}

export { Separator };
