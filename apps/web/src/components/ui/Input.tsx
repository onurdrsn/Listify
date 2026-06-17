import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> { label?: string; }

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-xs text-text-secondary">{label}</label>}
      <input
        ref={ref}
        className={cn(
          "bg-slate-800 border border-border rounded-sm px-3 py-2 text-sm text-text-primary",
          "placeholder:text-text-muted focus:outline-none focus:border-color-film/40 transition-colors w-full",
          className
        )}
        {...props}
      />
    </div>
  )
);
Input.displayName = "Input";
