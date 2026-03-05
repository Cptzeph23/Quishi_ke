"use client";
/**
 * FILE:    frontend/src/components/ui/Button.tsx
 * PURPOSE: Polymorphic button with variant, size, and loading state
 */
import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size    = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  Variant;
  size?:     Size;
  loading?:  boolean;
  fullWidth?: boolean;
  leftIcon?:  React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand-500 text-white hover:bg-brand-600 shadow-sm hover:shadow-md " +
    "hover:-translate-y-px active:translate-y-0 active:shadow-sm",
  secondary:
    "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 " +
    "hover:border-gray-300 shadow-sm",
  ghost:
    "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900",
  danger:
    "bg-red-500 text-white hover:bg-red-600 shadow-sm hover:shadow-md " +
    "hover:-translate-y-px",
};

const sizeClasses: Record<Size, string> = {
  sm:  "h-8  px-3  text-xs  gap-1.5 rounded-lg",
  md:  "h-10 px-5  text-sm  gap-2   rounded-xl",
  lg:  "h-12 px-7  text-base gap-2   rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant   = "primary",
      size      = "md",
      loading   = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          "inline-flex items-center justify-center font-medium",
          "transition-all duration-200 select-none",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-brand-500 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "disabled:hover:translate-y-0 disabled:hover:shadow-none",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";