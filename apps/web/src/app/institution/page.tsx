"use client";

import { StatCard } from "@/components/ui/stat-card";
import { ListCard } from "@/components/ui/list-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, SelectField } from "@/components/ui/form";
import { useState } from "react";

const kpis = [
  { label: "Total Students", value: "12,450", detail: "+45 this term", detailColor: "green" as const },
  { label: "Total Staff", value: "620", detail: "", detailColor: "muted" as const },
  { label: "Active Parents", value: "10,180", detail: "", detailColor: "muted" as const },
  { label: "Active Applicants", value: "214", detail: "", detailColor: "orange" as const },
  { label: "Attendance Today", value: "88.7%", detail: "-0.8% vs avg", detailColor: "red" as const },
  { label: "Revenue This Month", value: "$284K", detail: "+6.2%", detailColor: "green" as const },
  { label: "Outstanding Fees", value: "$92K", detail: "312 overdue", detailColor: "orange" as const },
  { label: "Pending Results", value: "18", detail: "awaiting approval", detailColor: "orange" as const },
];

const quickActions = [
  { title: "Add Student", subtitle: "Enroll a new student" },
  { title: "Add Staff", subtitle: "Create a staff account" },
  { title: "Record Payment", subtitle: "Process a fee payment" },
  { title: "Publish Announcement", subtitle: "Broadcast to parents" },
];

const pendingApprovals = [
  { t: "Admission — Chidi Eze", subtitle: "SS1 admission · 2h ago", badge: { text: "Review", variant: "orange" as const } },
  { t: "Results — SS2 Term 2", subtitle: "12 subjects · 4h ago", badge: { text: "Review", variant: "orange" as const } },
  { t: "Fee waiver — Grace Lim", subtitle: "$120 waiver · 1d ago", badge: { text: "Review", variant: "orange" as const } },
];

const recentAdmissions = [
  { avatar: "CE", avatarColor: "primary" as const, title: "Chidi Eze", subtitle: "SS1 Science · JUL 28" },
  { avatar: "AL", avatarColor: "green" as const, title: "Amara Okafor", subtitle: "JSS2 B · JUL 28" },
  { avatar: "TW", avatarColor: "purple" as const, title: "Tom Wallace", subtitle: "SS3 Art · JUL 27" },
];

const feeTrend = [
  { label: "W1", value: 65 }, { label: "W2", value: 78 }, { label: "W3", value: 71 },
  { label: "W4", value: 86 }, { label: "W5", value: 82 }, { label: "W6", value: 91 },
];
const maxFee = Math.max(...feeTrend.map((d) => d.value));

const upEvents = [
  { title: "Staff Meeting", subtitle: "Today · 2:00 PM" },
  { title: "PTA Meeting", subtitle: "Aug 4 · 4:00 PM" },
  { title: "Sports Day", subtitle: "Aug 15" },
];

export default function InstitutionDashboardPage() {
  const [quickOpen, setQuickOpen] = useState(false);
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Greenfield Academy Dashboard"
        subtitle="Operational overview · Academic Year 2026 · Term 3"
        actions={
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => setSubscriptionOpen(true)}>+ Add Subscription</Button>
            <Button onClick={() => setQuickOpen(true)}>+ Quick Action</Button>
          </div>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-text-dark mb-1">Fee Collection Trend</h3>
          <p className="text-xs text-text-muted mb-4">Weekly collection rate · 91.5%</p>
          <div className="flex items-end gap-2 h-32">
            {feeTrend.map((d, i) => (
              <div key={i} className="flex flex-col items-center flex-1 gap-1">
                <div className="w-full bg-green rounded-t-sm hover:bg-green/80" style={{ height: `${(d.value / maxFee) * 100}%` }} />
                <span className="text-[10px] text-text-muted">{d.label}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5 col-span-1">
          <h3 className="text-sm font-semibold text-text-dark mb-3">Pending Tasks</h3>
          <div className="flex flex-col gap-2">
            {pendingApprovals.map((a) => (
              <div key={a.t} className="flex items-center justify-between py-2 border-b border-border-light last:border-0">
                <div>
                  <p className="text-sm font-medium text-text-dark">{a.t}</p>
                  <p className="text-xs text-text-muted">{a.subtitle}</p>
                </div>
                <Badge variant={a.badge.variant as "orange"}>{a.badge.text}</Badge>
              </div>
            ))}
          </div>
        </Card>
        <ListCard title="Upcoming Events" items={upEvents.map((e) => ({ title: e.title, subtitle: e.subtitle }))} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <ListCard title="Recent Admissions" badge={<Badge variant="blue">3</Badge>} items={recentAdmissions} />
        <Card className="p-5 col-span-1">
          <h3 className="text-sm font-semibold text-text-dark mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((qa) => (
              <button key={qa.title} className="rounded-lg border border-border-light p-3 text-left hover:bg-surface hover:border-primary/40 transition-colors">
                <p className="text-sm font-medium text-text-dark">{qa.title}</p>
                <p className="text-xs text-text-muted mt-0.5">{qa.subtitle}</p>
              </button>
            ))}
          </div>
        </Card>
        <ListCard title="Institution Announcements" items={[
          { title: "Term 3 Resumption", subtitle: "All classes resume Aug 3" },
          { title: "New Fee Payment Deadline", subtitle: "Aug 15" },
        ]} />
      </div>

      <Modal open={quickOpen} onClose={() => setQuickOpen(false)} title="Quick Actions">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Enroll Student", desc: "Add a new student record" },
            { label: "Record Payment", desc: "Process a fee payment" },
            { label: "Add Staff", desc: "Create a staff account" },
            { label: "New Announcement", desc: "Broadcast to parents" },
          ].map((a) => (
            <button
              key={a.label}
              onClick={() => setQuickOpen(false)}
              className="rounded-lg border border-border-light p-4 text-left hover:bg-surface hover:border-primary/40 transition-colors"
            >
              <p className="text-sm font-medium text-text-dark">{a.label}</p>
              <p className="text-xs text-text-muted mt-0.5">{a.desc}</p>
            </button>
          ))}
        </div>
      </Modal>

      <Modal open={subscriptionOpen} onClose={() => setSubscriptionOpen(false)} title="Add Subscription" subtitle="Manage this institution's plan and billing cycle" footer={<><Button variant="secondary" onClick={() => setSubscriptionOpen(false)}>Cancel</Button><Button onClick={() => setSubscriptionOpen(false)}>Add Subscription</Button></>}>
        <div className="space-y-4">
          <SelectField label="Plan" required placeholder="Select plan" options={["Starter", "Growth", "Enterprise"]} value="" onChange={() => {}} />
          <SelectField label="Billing Cycle" required placeholder="Select billing cycle" options={["Monthly", "Annual"]} value="" onChange={() => {}} />
          <Field label="Amount" required>
            <TextInput type="number" placeholder="e.g. 1200" />
          </Field>
          <Field label="Start Date" required>
            <TextInput type="date" />
          </Field>
          <Field label="End Date" required>
            <TextInput type="date" />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
