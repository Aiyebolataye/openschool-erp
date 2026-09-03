"use client";

import { Bell, Search, ChevronDown } from "lucide-react";

export function TopNav() {
  return (
    <header className="h-16 bg-card border-b border-border-light flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-red rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">⬡</span>
        </div>
        <span className="font-display font-bold text-base text-text-dark">
          School ERP
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-text-muted hover:text-text-dark transition-colors">
          <Search className="w-5 h-5" />
        </button>
        <button className="relative p-2 text-text-muted hover:text-text-dark transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red rounded-full" />
        </button>
        <div className="flex items-center gap-2 ml-2">
          <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
            <span className="text-primary font-semibold text-sm">A</span>
          </div>
          <span className="text-sm font-medium text-text-dark">Admin</span>
          <ChevronDown className="w-4 h-4 text-text-muted" />
        </div>
      </div>
    </header>
  );
}
