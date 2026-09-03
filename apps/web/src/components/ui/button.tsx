import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const buttonVariants = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  secondary: "bg-card border border-border-light text-text-dark hover:bg-surface",
  ghost: "text-text-muted hover:text-text-dark hover:bg-surface",
  danger: "bg-red text-white hover:bg-red/90",
};

const buttonSizes = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-sm",
};

export function Button({ variant = "primary", size = "md", className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors",
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
