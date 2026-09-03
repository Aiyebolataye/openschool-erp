"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Organizations", href: "/organizations" },
  { label: "Institutions", href: "/institutions" },
  { label: "Subscriptions", href: "/subscriptions" },
  { label: "Modules", href: "/modules" },
  { label: "Institution Templates", href: "/institution-templates" },
  { label: "Users", href: "/users" },
  { label: "Roles & Permissions", href: "/roles" },
  { label: "Platform Configuration", href: "/platform-config" },
  { label: "Billing", href: "/billing" },
  { label: "Support Center", href: "/support" },
  { label: "Communication", href: "/communication" },
  { label: "Surveys", href: "/surveys" },
  { label: "Reports", href: "/reports" },
  { label: "Analytics", href: "/analytics" },
  { label: "Audit Logs", href: "/audit-logs" },
  { label: "Developer", href: "/developer" },
  { label: "System Health", href: "/system-health" },
  { label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-60 bg-primary-deep shrink-0 overflow-y-auto">
      <div className="py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
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
      <div className="border-t border-white/15 mx-4 my-2" />
      <div className="px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-white text-xs font-semibold">EA</span>
          </div>
          <div>
            <p className="text-sm font-medium text-white">Enterprise Admin</p>
            <p className="text-[10px] text-white/60 uppercase tracking-wider">Super Control</p>
          </div>
        </div>
      </div>
    </nav>
  );
}
