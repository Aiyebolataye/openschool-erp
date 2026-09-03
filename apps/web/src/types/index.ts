export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
}

export interface KpiCard {
  label: string;
  value: string;
  detail: string;
  detailColor?: "green" | "red" | "orange" | "muted";
}

export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  align?: "left" | "center" | "right";
}

export interface TableRow {
  [key: string]: string | { text: string; variant: "green" | "red" | "orange" | "muted" | "purple" | "blue" } | React.ReactNode;
}

export type BadgeVariant = "green" | "red" | "orange" | "muted" | "purple" | "blue";

export interface FilterOption {
  label: string;
  value: string;
}
