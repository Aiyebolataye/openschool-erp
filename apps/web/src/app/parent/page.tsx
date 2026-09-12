"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { ListCard } from "@/components/ui/list-card";

const children = [
  {
    name: "Chidi Eze",
    id: "STU-21401",
    className: "SS1 Science",
    type: "Day Student",
    avatar: "CE",
    avatarColor: "primary" as const,
  },
  {
    name: "Kayode Eze",
    id: "STU-21411",
    className: "SS1 Science",
    type: "Boarder · Red House — Boys",
    avatar: "KE",
    avatarColor: "orange" as const,
  },
];

const notices = [
  { title: "Term 3 Resumption — Aug 3", detail: "All classes resume Monday, 8:00 AM sharp.", time: "2 days ago" },
  { title: "Inter-house Sports Day", detail: "Parents invited. Red House vs Blue House.", time: "5 days ago" },
  { title: "PTA Meeting", detail: "Quarterly PTA meeting, 4:00 PM in the main hall.", time: "1 week ago" },
  { title: "New School Fees Structure", detail: "2026/2027 fee schedule now published.", time: "2 weeks ago" },
];

const feeAlerts = [
  { title: "Overdue: INV-2412 — Chidi Eze", detail: "₦425,000 outstanding for Term 3 2026", tone: "red" },
  { title: "Balance due: INV-2413 — Kayode Eze", detail: "₦675,000 (includes boarding) · Term 3 2026", tone: "orange" },
];

export default function ParentDashboardPage() {
  const stats = [
    { label: "Children", value: "2", detail: "SS1 Science", detailColor: "blue" as const },
    { label: "Outstanding Fees", value: "₦1.1m", detail: "2 invoices pending", detailColor: "red" as const },
    { label: "Upcoming Events", value: "4", detail: "Next: PTA Meeting", detailColor: "purple" as const },
    { label: "Recent Results", value: "1", detail: "Term 2 published", detailColor: "green" as const },
    { label: "Summer School Eligibility", value: "1", detail: "Kayode flagged", detailColor: "orange" as const },
    { label: "Attendance", value: "96%", detail: "Both children on track", detailColor: "green" as const },
  ];

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader title="Welcome back, Mr. Eze" subtitle="Here is what is happening with your children at Greenfield Academy" />

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <h3 className="text-sm font-semibold text-text-dark mb-3">My Children</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {children.map((c) => (
          <Card key={c.id} className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center ${c.avatarColor === "orange" ? "bg-orange-light text-orange" : "bg-primary-light text-primary"}`}>
                <span className="text-sm font-semibold">{c.avatar}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-text-dark">{c.name}</p>
                <p className="text-xs text-text-muted">{c.id} · {c.className}</p>
                <Badge variant={c.avatarColor === "orange" ? "orange" : "blue"} className="mt-1">{c.type}</Badge>
              </div>
            </div>
            <Link href="/parent/children">
              <Button size="sm" variant="secondary">View</Button>
            </Link>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ListCard
          title="Recent Notices"
          subtitle="Latest announcements from the school"
          badge={<Badge variant="blue">4 new</Badge>}
          items={notices.map((n) => ({
            title: n.title,
            subtitle: `${n.detail} · ${n.time}`,
            avatar: "N",
            avatarColor: "muted" as const,
          }))}
        />
        <ListCard
          title="Fee Alerts"
          subtitle="Outstanding balances that need attention"
          badge={<Badge variant="red">2 unpaid</Badge>}
          items={feeAlerts.map((f) => ({
            title: f.title,
            subtitle: f.detail,
            avatar: f.tone === "red" ? "!" : "!",
            avatarColor: f.tone === "red" ? ("red" as const) : ("orange" as const),
            action: (
              <Link href="/parent/fees">
                <Button size="sm" variant="ghost">Pay</Button>
              </Link>
            ),
          }))}
        />
      </div>
    </div>
  );
}
