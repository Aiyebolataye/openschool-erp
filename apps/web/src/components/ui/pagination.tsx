import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  return (
    <div className={cn("flex items-center justify-between px-4 py-3", className)}>
      <span className="text-sm text-text-muted">
        Page {currentPage} of {totalPages}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange?.(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-md text-text-muted hover:text-text-dark hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange?.(page)}
            className={cn(
              "w-8 h-8 rounded-md text-sm font-medium transition-colors",
              page === currentPage
                ? "bg-primary text-white"
                : "text-text-muted hover:text-text-dark hover:bg-surface"
            )}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onPageChange?.(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-md text-text-muted hover:text-text-dark hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
