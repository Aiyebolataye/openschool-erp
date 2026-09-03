import { cn } from "@/lib/utils";

export interface ListItem {
  avatar?: string;
  avatarColor?: "primary" | "green" | "orange" | "red" | "muted" | "purple";
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  action?: React.ReactNode;
}

const avatarColorMap = {
  primary: "bg-primary-light text-primary",
  green: "bg-green-light text-green",
  orange: "bg-orange-light text-orange",
  red: "bg-red-light text-red",
  muted: "bg-surface text-text-muted",
  purple: "bg-purple-light text-purple",
};

interface ListCardProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  headerAction?: React.ReactNode;
  items: ListItem[];
  className?: string;
}

export function ListCard({ title, subtitle, badge, headerAction, items, className }: ListCardProps) {
  return (
    <div className={cn("bg-card rounded-xl border border-border-light", className)}>
      <div className="flex items-center justify-between px-5 pt-5 pb-1">
        <div>
          <h3 className="text-sm font-semibold text-text-dark flex items-center gap-2">
            {title}
            {badge}
          </h3>
          {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
        </div>
        {headerAction}
      </div>
      <div className="flex flex-col px-5 pb-3 pt-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-3 border-b border-border-light last:border-0"
          >
            <div className="flex items-center gap-3 min-w-0">
              {item.avatar && (
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", avatarColorMap[item.avatarColor || "muted"])}>
                  <span className="text-xs font-semibold">{item.avatar}</span>
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-dark truncate">{item.title}</p>
                {item.subtitle && <p className="text-xs text-text-muted truncate">{item.subtitle}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {item.right}
              {item.action}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
