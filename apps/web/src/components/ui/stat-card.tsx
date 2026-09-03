import { cn } from "@/lib/utils";

export interface Stat {
  label: string;
  value: string;
  detail?: string;
  detailColor?: "green" | "red" | "orange" | "muted" | "blue";
}

const detailColorMap = {
  green: "text-green",
  red: "text-red",
  orange: "text-orange",
  muted: "text-text-muted",
  blue: "text-primary",
};

export function StatCard({ label, value, detail, detailColor = "muted", className }: Stat & { className?: string }) {
  return (
    <div
      className={cn(
        "bg-card rounded-xl border border-border-light p-5 flex flex-col gap-1",
        className
      )}
    >
      <span className="text-[11px] text-text-muted font-semibold uppercase tracking-wide">{label}</span>
      <span className="text-2xl font-bold text-text-dark font-display">{value}</span>
      {detail && <span className={cn("text-xs", detailColorMap[detailColor])}>{detail}</span>}
    </div>
  );
}
