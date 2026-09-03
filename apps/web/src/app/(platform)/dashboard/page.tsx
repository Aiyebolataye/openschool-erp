"use client";

import { useState } from "react";
import { KpiCard } from "@/components/ui/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { SearchInput } from "@/components/ui/search-input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import { ChevronDown, Download, Eye, AlertTriangle, Clock, TrendingUp, ArrowUpRight, Bell, Settings, User } from "lucide-react";
import { Modal } from "@/components/ui/modal";

const heroMetrics = [
  { label: "TOTAL ORGANIZATIONS", value: "127", detail: "+12.4% · +12 new this month", detailColor: "green" as const },
  { label: "MONTHLY REVENUE", value: "$284,200", detail: "+12.3% · vs $253k last month", detailColor: "green" as const },
  { label: "ACTIVE USERS (MAU)", value: "38.2K", detail: "+5.4% vs last month", detailColor: "green" as const },
  { label: "TOTAL INSTITUTIONS", value: "384", detail: "81.3% active rate", detailColor: "muted" as const },
];

const secondaryMetrics = [
  { label: "ACTIVE", value: "312", detail: "81%", detailColor: "green" as const },
  { label: "TRIAL", value: "42", detail: "11%", detailColor: "orange" as const },
  { label: "SUSPENDED", value: "30", detail: "8%", detailColor: "red" as const },
  { label: "STUDENTS", value: "89.2K", detail: "+3.2K", detailColor: "green" as const },
  { label: "STAFF", value: "12.5K", detail: "+420", detailColor: "green" as const },
  { label: "LIVE SESSIONS", value: "1.8K", detail: "Now", detailColor: "muted" as const },
  { label: "OUTSTANDING", value: "$18.2K", detail: "Alert", detailColor: "orange" as const },
  { label: "OPEN TICKETS", value: "23", detail: "3 urgent", detailColor: "red" as const },
];

const pendingApprovals = [
  { name: "Greenfield Academy", time: "2 hours ago" },
  { name: "Riverside School", time: "5 hours ago" },
  { name: "Summit High School", time: "Yesterday" },
];

const recentSignups = [
  { name: "Valley Prep School", plan: "Pro Plan", date: "2 days ago" },
  { name: "Mountain View Academy", plan: "Enterprise", date: "3 days ago" },
  { name: "Coastal Learning Center", plan: "Starter", date: "4 days ago" },
];

const nextRenewals = [
  { name: "Westfield Intl.", plan: "Enterprise", date: "Jul 28", status: "ACTIVE" },
  { name: "Pacific Academy", plan: "Pro Plan", date: "Aug 1", status: "ACTIVE" },
  { name: "Heritage Schools", plan: "Enterprise", date: "Aug 5", status: "REVIEW" },
];

const recentTickets = [
  { priority: "URGENT", title: "Integration not syncing", org: "Greenfield Academy", category: "High Priority", time: "1H AGO" },
  { priority: "NORMAL", title: "Billing question", org: "Pacific Academy", category: "Financial", time: "3H AGO" },
];

const releaseNotes = [
  { version: "v3.2.0 API Dashboard", date: "JUL 22", scope: "PLATFORM-WIDE" },
  { version: "Rate Limit Policy Update", date: "AUG 1", scope: "ALL TENANTS" },
  { version: "Advanced Analytics Module", date: "JUL 18", scope: "ENTERPRISE" },
];

const auditLog = [
  { category: "TENANT", event: "Greenfield Academy newly activated on platform", actor: "admin@platform.com", time: "2 hours ago" },
  { category: "SUB", event: "Pacific Academy plan upgraded to Enterprise tier", actor: "admin@platform.com", time: "5 hours ago" },
  { category: "SECURITY", event: "IP blocklist updated with 3 new high-risk entries", actor: "security@platform.com", time: "8 hours ago" },
];

const barData = [
  { label: "JUL", value: 65 }, { label: "AUG", value: 72 }, { label: "SEP", value: 58 },
  { label: "OCT", value: 80 }, { label: "NOV", value: 68 }, { label: "DEC", value: 85 },
  { label: "JAN", value: 90 }, { label: "FEB", value: 75 }, { label: "MAR", value: 82 },
  { label: "APR", value: 95 }, { label: "MAY", value: 88 }, { label: "JUN", value: 78 },
];

function BarChart({ data, title }: { data: typeof barData; title: string }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end gap-2 h-40">
        {data.map((d, i) => (
          <div key={i} className="flex flex-col items-center flex-1 gap-1">
            <div
              className="w-full bg-primary/80 rounded-t-sm transition-all hover:bg-primary"
              style={{ height: `${(d.value / max) * 100}%` }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        {data.map((d, i) => (
          <span key={i} className="flex-1 text-center text-[10px] text-text-muted">{d.label}</span>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [open, setOpen] = useState(false);
  const [reviewItem, setReviewItem] = useState<string | null>(null);

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="System Overview"
        subtitle={
          <span className="flex items-center gap-2">
            Platform status
            <span className="text-text-muted">·</span>
            July 2026
            <span className="text-text-muted">·</span>
            <span className="inline-flex items-center gap-1 text-green text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green" />
              All systems operational
            </span>
          </span>
        }
        actions={
          <>
            <Select
              options={[{ label: "Last 30 Days", value: "30d" }]}
              placeholder="Last 30 Days"
            />
            <Button variant="primary">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          </>
        }
      />

      {/* Hero KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {heroMetrics.map((m) => (
          <KpiCard key={m.label} {...m} />
        ))}
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-8 gap-3 mb-6">
        {secondaryMetrics.map((m) => (
          <KpiCard key={m.label} {...m} className="p-4" />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-text-dark">Institution Growth Trends</h3>
              <p className="text-xs text-text-muted mt-0.5">Registration volume by month</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="green">↑ 18% YoY</Badge>
              <Button variant="ghost" size="sm"><ChevronDown className="w-4 h-4" /></Button>
            </div>
          </div>
          <BarChart data={barData} title="Growth" />
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-text-dark">Revenue Performance</h3>
              <p className="text-xs text-text-muted mt-0.5">Subscription billing cycle overview</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="blue">$284k Target</Badge>
              <Button variant="ghost" size="sm"><ChevronDown className="w-4 h-4" /></Button>
            </div>
          </div>
          <BarChart data={barData} title="Revenue" />
        </Card>
      </div>

      {/* Dynamic Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Left Column */}
        <div className="flex flex-col gap-4">
          {/* Pending Approvals */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-dark">Pending Approvals</h3>
              <Badge variant="orange">8 AWAITING</Badge>
            </div>
            <div className="flex flex-col gap-3">
              {pendingApprovals.map((item) => (
                <div key={item.name} className="flex items-center justify-between py-2 border-b border-border-light last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
                      <span className="text-primary text-xs font-semibold">{item.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-dark">{item.name}</p>
                      <p className="text-xs text-text-muted">{item.time}</p>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => { setReviewItem(item.name); setOpen(true); }}>Review</Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Signups */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-dark">Recent Signups</h3>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            <div className="flex flex-col gap-3">
              {recentSignups.map((item) => (
                <div key={item.name} className="flex items-center justify-between py-2 border-b border-border-light last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center">
                      <span className="text-text-muted text-xs font-semibold">{item.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-dark">{item.name}</p>
                      <p className="text-xs text-text-muted">{item.plan} · {item.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Support Dynamics */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-text-dark">Support Dynamics</h3>
                <p className="text-xs text-text-muted mt-0.5">Ticket volume vs resolution velocity</p>
              </div>
            </div>
            <div className="flex items-center gap-4 mb-3">
              <span className="flex items-center gap-1.5 text-xs text-text-muted">
                <span className="w-2 h-2 rounded-full bg-primary" /> INCOMING
              </span>
              <span className="flex items-center gap-1.5 text-xs text-text-muted">
                <span className="w-2 h-2 rounded-full bg-green" /> RESOLVED
              </span>
            </div>
            <BarChart data={barData} title="Support" />
          </Card>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4">
          {/* Next Renewals */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-text-dark mb-4">Next Renewals</h3>
            <div className="flex flex-col gap-3">
              {nextRenewals.map((item) => (
                <div key={item.name} className="flex items-center justify-between py-2 border-b border-border-light last:border-0">
                  <div>
                    <p className="text-sm font-medium text-text-dark">{item.name}</p>
                    <p className="text-xs text-text-muted">{item.plan} · {item.date}</p>
                  </div>
                  <Badge variant={item.status === "ACTIVE" ? "green" : "orange"}>{item.status}</Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Payments Alert */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-dark">Payments Alert</h3>
              <AlertTriangle className="w-4 h-4 text-orange" />
            </div>
            <p className="text-xl font-bold text-text-dark mb-3">$18,200 <span className="text-xs font-normal text-text-muted">OUTSTANDING</span></p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between py-2 border-b border-border-light">
                <div>
                  <p className="text-sm font-medium text-text-dark">Greenfield</p>
                  <p className="text-xs text-red">DECLINED · 3D</p>
                </div>
                <span className="text-sm font-semibold text-text-dark">$2.4k</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border-light last:border-0">
                <div>
                  <p className="text-sm font-medium text-text-dark">Pacific</p>
                  <p className="text-xs text-orange">FUNDS · 5D</p>
                </div>
                <span className="text-sm font-semibold text-text-dark">$4.8k</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="mt-3">View History</Button>
          </Card>

          {/* Recent Tickets */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-dark">Recent Tickets</h3>
              <Button variant="secondary" size="sm">Support Desk</Button>
            </div>
            <div className="flex flex-col gap-3">
              {recentTickets.map((ticket) => (
                <div key={ticket.title} className="flex items-center justify-between py-2 border-b border-border-light last:border-0">
                  <div className="flex items-center gap-3">
                    <Badge variant={ticket.priority === "URGENT" ? "red" : "muted"}>{ticket.priority}</Badge>
                    <div>
                      <p className="text-sm font-medium text-text-dark">{ticket.title}</p>
                      <p className="text-xs text-text-muted">{ticket.org} · {ticket.category}</p>
                    </div>
                  </div>
                  <span className="text-xs text-text-muted">{ticket.time}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Release Notes */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-text-dark mb-4">Release Notes</h3>
            <div className="flex flex-col gap-3">
              {releaseNotes.map((note) => (
                <div key={note.version} className="flex items-center justify-between py-2 border-b border-border-light last:border-0">
                  <div>
                    <p className="text-sm font-medium text-text-dark">{note.version}</p>
                    <p className="text-xs text-text-muted">{note.date} · {note.scope}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Maintenance */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-text-dark mb-4">Maintenance</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between py-2 border-b border-border-light">
                <div>
                  <p className="text-sm font-medium text-text-dark">DB Migration</p>
                  <p className="text-xs text-text-muted">Jul 28, 02:00 UTC</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border-light last:border-0">
                <div>
                  <p className="text-sm font-medium text-text-dark">SSL Renewal</p>
                  <p className="text-xs text-text-muted">Aug 03, 01:00 UTC</p>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-text-muted mt-3 uppercase tracking-wider">No service interruption expected</p>
          </Card>
        </div>
      </div>

      {/* Global Audit Log */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-text-dark">Global Audit Log</h3>
            <p className="text-xs text-text-muted mt-0.5">LAST 24 HOURS</p>
          </div>
          <Button variant="secondary" size="sm">View Full Platform Log</Button>
        </div>
        <div className="flex flex-col gap-3">
          {auditLog.map((log) => (
            <div key={log.event} className="flex items-center justify-between py-3 border-b border-border-light last:border-0">
              <div className="flex items-center gap-4">
                <Badge variant={log.category === "SECURITY" ? "red" : log.category === "SUB" ? "blue" : "muted"}>{log.category}</Badge>
                <div>
                  <p className="text-sm text-text-dark">{log.event}</p>
                  <p className="text-xs text-text-muted">{log.actor}</p>
                </div>
              </div>
              <span className="text-xs text-text-muted whitespace-nowrap">{log.time}</span>
            </div>
          ))}
        </div>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Review Pending Item"
        footer={
          <>
            <Button variant="danger" onClick={() => setOpen(false)}>Reject</Button>
            <Button onClick={() => setOpen(false)}>Approve</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 py-2 px-3 bg-surface rounded-lg">
            <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
              <span className="text-primary text-xs font-semibold">{reviewItem ? reviewItem[0] : ""}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-text-dark">{reviewItem || "Pending Item"}</p>
              <p className="text-xs text-text-muted">Awaiting approval</p>
            </div>
          </div>
          <p className="text-xs text-text-muted">
            Review the details for this pending item before approving or rejecting. Once approved, the organization will be activated on the platform.
          </p>
        </div>
      </Modal>
    </div>
  );
}
