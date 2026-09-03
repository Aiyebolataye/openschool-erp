"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface NavItem {
  label: string;
  href: string;
}

export interface WorkspaceLayoutProps {
  workspace: string;
  brand: string;
  user: { name: string; role: string; initials: string };
  navigation: NavItem[];
  children: React.ReactNode;
  accent?: "primary" | "green" | "orange" | "purple" | "teal";
}

export function WorkspaceLayout({
  workspace,
  brand,
  user,
  navigation,
  children,
  accent = "primary",
}: WorkspaceLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-screen">
      <header className="h-16 bg-card border-b border-border-light flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary text-white">
            <span className="font-bold text-sm">⬡</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-base text-text-dark leading-tight">
              {brand}
            </span>
            <span className="text-[10px] text-text-muted uppercase tracking-wider leading-tight">
              {workspace}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-text-muted hover:text-text-dark transition-colors" aria-label="Search">
            <SearchIcon />
          </button>
          <button className="relative p-2 text-text-muted hover:text-text-dark transition-colors" aria-label="Notifications">
            <BellIcon />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
          </button>
          <div className="flex items-center gap-2 ml-2">
            <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
              <span className="text-primary font-semibold text-sm">{user.initials}</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-medium text-text-dark">{user.name}</span>
              <span className="text-[10px] text-text-muted">{user.role}</span>
            </div>
          </div>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <nav className="w-60 bg-primary-deep shrink-0 overflow-y-auto">
          <div className="py-4">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-3 px-5 py-2.5 text-sm transition-colors",
                    isActive
                      ? "text-white font-medium bg-white/15"
                      : "text-white/75 hover:text-white hover:bg-white/10"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-white rounded-r" />
                  )}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
        <main className="flex-1 overflow-y-auto bg-surface p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}
