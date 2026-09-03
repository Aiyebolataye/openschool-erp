import { cn } from "@/lib/utils";
import type { BadgeVariant } from "@/types";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const badgeVariantMap: Record<BadgeVariant, string> = {
  green: "bg-green-light text-green",
  red: "bg-red-light text-red",
  orange: "bg-orange-light text-orange",
  muted: "bg-surface text-text-muted",
  purple: "bg-purple-light text-purple",
  blue: "bg-primary-light text-primary",
};

export function Badge({ children, variant = "muted", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        badgeVariantMap[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
