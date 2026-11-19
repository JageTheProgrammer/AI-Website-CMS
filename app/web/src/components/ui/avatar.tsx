import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils/cn";

interface AvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  src?: string | null;
  alt: string;
}

function Avatar({ className, src, alt, ...props }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
      {...props}
    >
      {src ? (
        <AvatarPrimitive.Image className="aspect-square h-full w-full" src={src} alt={alt} />
      ) : (
        <AvatarPrimitive.Fallback className="flex h-full w-full items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {alt.charAt(0).toUpperCase()}
          </span>
        </AvatarPrimitive.Fallback>
      )}
    </AvatarPrimitive.Root>
  );
}

export { Avatar };
