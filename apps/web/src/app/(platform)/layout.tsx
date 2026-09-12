"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { TopNav } from "@/components/layout/top-nav";
import { Sidebar, navigation } from "@/components/layout/sidebar";
import { cn } from "@/lib/utils";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-screen">
      <TopNav onMenuClick={() => setMobileOpen(true)} />

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
            <div className="py-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "relative flex items-center gap-3 px-5 py-3 text-sm transition-colors",
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
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-surface p-6">{children}</main>
      </div>
    </div>
  );
}
