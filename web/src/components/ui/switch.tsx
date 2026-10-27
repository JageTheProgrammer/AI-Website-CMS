import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils/cn";

interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

function Switch({ className, checked, onCheckedChange, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "relative h-5 w-9 rounded-full transition-colors duration-200",
        "bg-zinc-300 data-[state=checked]:bg-zinc-900 dark:bg-zinc-700 dark:data-[state=checked]:bg-zinc-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:focus-visible:ring-zinc-300 dark:focus-visible:ring-offset-zinc-950",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      checked={checked}
      onCheckedChange={onCheckedChange}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm",
          "translate-x-0.5 transition-transform duration-200 data-[state=checked]:translate-x-4",
          "dark:bg-zinc-950",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
