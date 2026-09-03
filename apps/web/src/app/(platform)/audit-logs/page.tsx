"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { ChevronRight } from "lucide-react";

const auditEntries = [
  { category: "TENANT", event: "Greenfield Academy newly activated on platform", actor: "admin@platform.com", time: "2 hours ago" },
  { category: "SUB", event: "Pacific Academy plan upgraded to Enterprise tier", actor: "admin@platform.com", time: "5 hours ago" },
  { category: "SECURITY", event: "IP blocklist updated with 3 new high-risk entries", actor: "security@platform.com", time: "8 hours ago" },
];

const categoryVariant: Record<string, "blue" | "muted" | "red"> = {
  TENANT: "blue",
  SUB: "muted",
  SECURITY: "red",
};

export default function AuditLogsPage() {
  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Global Audit Log"
        subtitle="LAST 24 HOURS"
        actions={<Button variant="secondary">View Full Platform Log</Button>}
      />

      <Card className="divide-y divide-border-light">
        {auditEntries.map((entry) => (
          <div key={entry.event} className="flex items-center justify-between px-5 py-4 hover:bg-surface/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <Badge variant={categoryVariant[entry.category]}>{entry.category}</Badge>
              <div>
                <p className="text-sm text-text-dark">{entry.event}</p>
                <p className="text-xs text-text-muted mt-0.5">{entry.actor}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-text-muted whitespace-nowrap">{entry.time}</span>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
