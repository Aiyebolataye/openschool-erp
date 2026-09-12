import { cn } from "@/lib/utils";
import type { TableColumn, TableRow } from "@/types";

interface DataTableProps {
  columns: TableColumn[];
  data: TableRow[];
  className?: string;
  onRowClick?: (row: TableRow, index: number) => void;
}

export function DataTable({ columns, data, className, onRowClick }: DataTableProps) {
  return (
    <div className={cn("bg-card rounded-xl border border-border-light overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-light">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider",
                    col.align === "center" && "text-center",
                    col.align === "right" && "text-right"
                  )}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={i}
                onClick={onRowClick ? () => onRowClick(row, i) : undefined}
                className={`border-b border-border-light last:border-0 transition-colors ${
                  onRowClick ? "cursor-pointer hover:bg-surface/50" : "hover:bg-surface/50"
                }`}
              >
                {columns.map((col) => {
                  const cell = row[col.key];
                  return (
                    <td
                      key={col.key}
                      className={cn(
                        "px-4 py-3 text-sm text-text-dark",
                        col.align === "center" && "text-center",
                        col.align === "right" && "text-right"
                      )}
                    >
                      {typeof cell === "object" && cell !== null && "text" in cell ? (
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                            cell.variant === "green" && "bg-green-light text-green",
                            cell.variant === "red" && "bg-red-light text-red",
                            cell.variant === "orange" && "bg-orange-light text-orange",
                            cell.variant === "muted" && "bg-surface text-text-muted",
                            cell.variant === "purple" && "bg-purple-light text-purple",
                            cell.variant === "blue" && "bg-primary-light text-primary"
                          )}
                        >
                          {cell.text}
                        </span>
                      ) : (
                        cell as React.ReactNode
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
