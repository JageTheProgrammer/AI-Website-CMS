import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: "success" | "error" | "warning" | "info";
}

type UseToastReturn = {
  toast: (options: ToastOptions) => void;
};

const TOAST_ICONS = {
  success: <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
  error: <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />,
  warning: <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
  info: <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
};

function ToastRoot({ children, className, ...props }: React.ComponentProps<typeof ToastPrimitive.Root>) {
  return (
    <ToastPrimitive.Provider>
      <ToastPrimitive.Root
        className={cn(
          "flex gap-3 items-start rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950",
          className,
        )}
        {...props}
      >
        {children}
      </ToastPrimitive.Root>
      <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm" />
    </ToastPrimitive.Provider>
  );
}

interface ToastProps extends ToastOptions {
  open: boolean;
  onClose: () => void;
}

function Toast({ title, description, variant = "info", open, onClose }: ToastProps) {
  return (
    <ToastRoot open={open} onOpenChange={onClose} duration={variant === "success" ? 3000 : 5000}>
      {TOAST_ICONS[variant]}
      <div className="flex-1">
        {title && <p className="font-medium text-zinc-900 dark:text-zinc-50">{title}</p>}
        {description && <p className="text-sm text-zinc-600 dark:text-zinc-400">{description}</p>}
      </div>
    </ToastRoot>
  );
}

export { Toast, ToastRoot };
export type { ToastOptions, UseToastReturn };
