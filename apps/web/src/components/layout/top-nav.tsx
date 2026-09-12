"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Search, ChevronDown, Menu } from "lucide-react";

const notifications = [
  { title: "Org activation pending", detail: "Greenfield Academy requested activation", time: "12 min ago", tone: "orange" },
  { title: "Subscription near expiry", detail: "Pacific Academy renews in 3 days", time: "1 hr ago", tone: "red" },
  { title: "Support ticket escalated", detail: "URGENT · Integration not syncing", time: "2 hrs ago", tone: "red" },
  { title: "Survey reached 1,000 responses", detail: "Platform Satisfaction Q3", time: "5 hrs ago", tone: "green" },
];

const quickLinks = [
  { label: "Organizations", href: "/organizations" },
  { label: "Institutions", href: "/institutions" },
  { label: "Subscriptions", href: "/subscriptions" },
  { label: "Users", href: "/users" },
  { label: "Billing", href: "/billing" },
  { label: "Analytics", href: "/analytics" },
];

export function TopNav({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const basePath = "/" + (pathname.split("/")[1] ?? "");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState("");

  const searchable = [
    ...quickLinks,
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
    <header className="h-16 bg-card border-b border-border-light flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden p-2 -ml-2 text-text-muted hover:text-text-dark transition-colors"
          aria-label="Open menu"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 bg-red rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">⬡</span>
        </div>
        <span className="font-display font-bold text-base text-text-dark">
          School ERP
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button
          className="relative p-2 text-text-muted hover:text-text-dark transition-colors"
          onClick={() => { closeAll(); setSearchOpen((v) => !v); }}
        >
          <Search className="w-5 h-5" />
        </button>
        <button
          className="relative p-2 text-text-muted hover:text-text-dark transition-colors"
          onClick={() => { closeAll(); setNotifOpen((v) => !v); }}
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red rounded-full" />
        </button>
        <button
          className="flex items-center gap-2 ml-2 rounded-lg hover:bg-surface transition-colors px-2 py-1"
          onClick={() => { closeAll(); setProfileOpen((v) => !v); }}
        >
          <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
            <span className="text-primary font-semibold text-sm">A</span>
          </div>
          <span className="text-sm font-medium text-text-dark">Admin</span>
          <ChevronDown className="w-4 h-4 text-text-muted" />
        </button>
      </div>

      {searchOpen && (
        <div className="absolute top-16 right-6 z-50 w-80 rounded-xl border border-border-light bg-card shadow-xl p-4">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search organizations, users, pages..."
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
              <span className="text-primary font-semibold text-sm">A</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-text-dark">Admin</p>
              <p className="text-[10px] text-text-muted">Platform Admin</p>
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
              Platform Settings
            </Link>
            <button className="px-4 py-2.5 text-sm text-red hover:bg-surface transition-colors text-left">
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}