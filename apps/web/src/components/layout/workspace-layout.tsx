"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
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
  sidebarExtra?: React.ReactNode;
  accent?: "primary" | "green" | "orange" | "purple" | "teal";
}

const notifications = [
  { title: "3 pending approvals", detail: "New fee waivers awaiting your review", time: "10 min ago", tone: "orange" },
  { title: "Attendance below 80%", detail: "SS3 Art recorded 76% today", time: "1 hr ago", tone: "red" },
  { title: "Fee payment received", detail: "Chidi Eze paid ₦420 · Term 3", time: "3 hrs ago", tone: "green" },
  { title: "New student enrollment", detail: "Omar Farouk enrolled in SS3 Art", time: "Yesterday", tone: "blue" },
];

export function WorkspaceLayout({
  workspace,
  brand,
  user,
  navigation,
  children,
  sidebarExtra,
  accent = "primary",
}: WorkspaceLayoutProps) {
  const pathname = usePathname();
  const basePath = "/" + (pathname.split("/")[1] ?? "");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");

  const searchable = [
    ...navigation,
    { label: "Profile", href: `${basePath}/profile` },
    { label: "Settings", href: `${basePath}/settings` },
  ];

  const filteredLinks = searchable.filter((l) =>
    l.label.toLowerCase().includes(query.toLowerCase())
  );

  const closeAll = () => {
    setSearchOpen(false);
    setNotifOpen(false);
    setProfileOpen(false);
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="h-16 bg-card border-b border-border-light flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-2 -ml-2 text-text-muted hover:text-text-dark transition-colors"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
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
          <button
            className="relative p-2 text-text-muted hover:text-text-dark transition-colors"
            aria-label="Search"
            onClick={() => { closeAll(); setSearchOpen((v) => !v); }}
          >
            <SearchIcon />
          </button>
          <button
            className="relative p-2 text-text-muted hover:text-text-dark transition-colors"
            aria-label="Notifications"
            onClick={() => { closeAll(); setNotifOpen((v) => !v); }}
          >
            <BellIcon />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
          </button>
          <button
            className="flex items-center gap-2 ml-2 rounded-lg hover:bg-surface transition-colors px-2 py-1"
            onClick={() => { closeAll(); setProfileOpen((v) => !v); }}
          >
            <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
              <span className="text-primary font-semibold text-sm">{user.initials}</span>
            </div>
            <div className="flex flex-col leading-tight text-left">
              <span className="text-sm font-medium text-text-dark">{user.name}</span>
              <span className="text-[10px] text-text-muted">{user.role}</span>
            </div>
          </button>
        </div>
      </header>

      {searchOpen && (
        <div className="absolute top-16 right-6 z-50 w-80 rounded-xl border border-border-light bg-card shadow-xl p-4">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, students, staff..."
            className="w-full h-10 px-3 rounded-lg border border-border-light bg-surface text-sm text-text-dark placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <div className="mt-3 flex flex-col gap-1">
            {query && filteredLinks.length === 0 && (
              <p className="text-xs text-text-muted px-2 py-2">No results for “{query}”</p>
            )}
            {(query ? filteredLinks : searchable).map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setSearchOpen(false)}
                className="flex items-center justify-between px-2 py-2 rounded-md text-sm text-text-dark hover:bg-surface transition-colors"
              >
                {l.label}
                <span className="text-[10px] text-text-muted uppercase">Go →</span>
              </Link>
            ))}
          </div>
          {!query && (
            <p className="text-[10px] text-text-muted mt-3 px-2">Quick links across the workspace</p>
          )}
        </div>
      )}

      {notifOpen && (
        <div className="absolute top-16 right-6 z-50 w-80 rounded-xl border border-border-light bg-card shadow-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border-light flex items-center justify-between">
            <p className="text-sm font-semibold text-text-dark">Notifications</p>
            <span className="text-[10px] text-text-muted">4 new</span>
          </div>
          <div className="flex flex-col divide-y divide-border-light">
            {notifications.map((n) => (
              <div key={n.title} className="px-4 py-3 hover:bg-surface transition-colors">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${n.tone === "green" ? "bg-green" : n.tone === "red" ? "bg-red" : n.tone === "orange" ? "bg-orange" : "bg-primary"}`} />
                  <p className="text-sm font-medium text-text-dark">{n.title}</p>
                </div>
                <p className="text-xs text-text-muted mt-0.5">{n.detail}</p>
                <p className="text-[10px] text-text-muted/70 mt-0.5">{n.time}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {profileOpen && (
        <div className="absolute top-16 right-6 z-50 w-72 rounded-xl border border-border-light bg-card shadow-xl overflow-hidden">
          <div className="px-4 py-4 border-b border-border-light flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
              <span className="text-primary font-semibold text-sm">{user.initials}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-text-dark">{user.name}</p>
              <p className="text-[10px] text-text-muted">{user.role} · {workspace}</p>
            </div>
          </div>
          <div className="flex flex-col py-1">
            <Link
              href={`${basePath}/profile`}
              onClick={() => setProfileOpen(false)}
              className="px-4 py-2.5 text-sm text-text-dark hover:bg-surface transition-colors"
            >
              Profile Settings
            </Link>
            <Link
              href={`${basePath}/settings`}
              onClick={() => setProfileOpen(false)}
              className="px-4 py-2.5 text-sm text-text-dark hover:bg-surface transition-colors"
            >
              Workspace Settings
            </Link>
            <button className="px-4 py-2.5 text-sm text-red hover:bg-surface transition-colors text-left">
              Sign out
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <nav className="hidden lg:flex w-60 bg-primary-deep shrink-0 overflow-y-auto">
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
          {sidebarExtra}
        </nav>
        <main className="flex-1 overflow-y-auto bg-surface p-6">
          {children}
        </main>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 bg-primary-deep overflow-y-auto flex flex-col">
            <div className="flex justify-end p-3 shrink-0">
              <button
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="p-2 text-white/75 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1">
              <div className="pb-4">
                {navigation.map((item) => {
                  const isActive =
                    pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
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
              {sidebarExtra}
            </div>
          </div>
        </div>
      )}
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