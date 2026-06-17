import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "solid" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, variant = "solid", size = "md", loading, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center rounded-sm font-medium transition-colors cursor-pointer select-none",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-700 disabled:opacity-50 disabled:pointer-events-none",
          variant === "solid" && "bg-slate-100 text-slate-900 hover:bg-slate-200",
          variant === "outline" && "border border-border bg-transparent text-text-primary hover:bg-slate-800/50 hover:border-border-hover",
          variant === "ghost" && "bg-transparent text-text-secondary hover:text-text-primary hover:bg-slate-800/60",
          variant === "danger" && "bg-color-food text-text-primary hover:bg-color-food/90",
          size === "sm" && "px-3 py-1.5 text-xs",
          size === "md" && "px-4 py-2 text-sm",
          size === "lg" && "px-6 py-3 text-base",
          className
        )}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
