"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { ChevronRight } from "lucide-react";
import { Modal } from "@/components/ui/modal";

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
  const [open, setOpen] = useState(false);

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Global Audit Log"
        subtitle="LAST 24 HOURS"
        actions={<Button variant="secondary" onClick={() => setOpen(true)}>View Full Platform Log</Button>}
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

      <Modal open={open} onClose={() => setOpen(false)} title="Full Platform Audit Log" footer={<Button onClick={() => setOpen(false)}>Close</Button>}>
        <div className="flex flex-col gap-3">
          {auditEntries.map((entry) => (
            <div key={entry.event} className="flex items-center justify-between py-2 border-b border-border-light last:border-0">
              <div className="flex items-center gap-3">
                <Badge variant={categoryVariant[entry.category]}>{entry.category}</Badge>
                <div>
                  <p className="text-sm text-text-dark">{entry.event}</p>
                  <p className="text-xs text-text-muted">{entry.actor} — {entry.time}</p>
                </div>
              </div>
            </div>
          ))}
          <p className="text-xs text-text-muted mt-2">Full audit log view coming soon. This is a preview of recent entries.</p>
        </div>
      </Modal>
    </div>
  );
}
