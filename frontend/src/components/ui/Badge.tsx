/**
 * FILE:    frontend/src/components/ui/Badge.tsx
 * PURPOSE: Status and label badges
 */
import { cn } from "@/lib/utils";
import { statusBadgeClass } from "@/lib/utils";

interface BadgeProps {
  children:  React.ReactNode;
  variant?:  "status" | "type" | "neutral";
  status?:   string;
  className?: string;
}

export function Badge({ children, status, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "badge capitalize",
        status ? statusBadgeClass(status) : "text-gray-600 bg-gray-100 border-gray-200",
        className
      )}
    >
      {children}
    </span>
  );
}