import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  detail: string;
  detailColor?: "green" | "red" | "orange" | "muted";
  className?: string;
}

const detailColorMap = {
  green: "text-green",
  red: "text-red",
  orange: "text-orange",
  muted: "text-text-muted",
};

export function KpiCard({ label, value, detail, detailColor = "muted", className }: KpiCardProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-xl border border-border-light p-6 flex flex-col gap-1",
        className
      )}
    >
      <span className="text-sm text-text-muted font-medium">{label}</span>
      <span className="text-3xl font-bold text-text-dark font-display">{value}</span>
      <span className={cn("text-sm", detailColorMap[detailColor])}>{detail}</span>
    </div>
  );
}
