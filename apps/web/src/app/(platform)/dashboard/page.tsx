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
import Link from "next/link";

const heroMetrics = [
  { label: "TOTAL ORGANIZATIONS", value: "127", detail: "", detailColor: "green" as const },
  { label: "MONTHLY REVENUE", value: "₦284,200", detail: "", detailColor: "green" as const },
  { label: "ACTIVE USERS (MAU)", value: "38.2K", detail: "", detailColor: "green" as const },
  { label: "TOTAL INSTITUTIONS", value: "384", detail: "", detailColor: "muted" as const },
];

const secondaryMetrics = [
  { label: "ACTIVE", value: "312", detail: "", detailColor: "green" as const },
  { label: "TRIAL", value: "42", detail: "", detailColor: "orange" as const },
  { label: "SUSPENDED", value: "30", detail: "", detailColor: "red" as const },
  { label: "STUDENTS", value: "89.2K", detail: "", detailColor: "green" as const },
  { label: "STAFF", value: "12.5K", detail: "", detailColor: "green" as const },
  { label: "LIVE SESSIONS", value: "1.8K", detail: "", detailColor: "muted" as const },
  { label: "OUTSTANDING", value: "₦18.2K", detail: "", detailColor: "orange" as const },
  { label: "OPEN TICKETS", value: "23", detail: "", detailColor: "red" as const },
];

const pendingApprovals = [
  { name: "Demo Academy", time: "2 hours ago" },
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
  { priority: "URGENT", title: "Integration not syncing", org: "Demo Academy", category: "High Priority", time: "1H AGO", description: "The LMS integration has not synced attendance data for the past 24 hours. The org admin reports the webhook is receiving 503 responses from our endpoint." },
  { priority: "NORMAL", title: "Billing question", org: "Pacific Academy", category: "Financial", time: "3H AGO", description: "The org admin is asking about the prorated charge applied when upgrading from the Pro plan to Enterprise mid-cycle." },
];

const releaseNotes = [
  { version: "v3.2.0 API Dashboard", date: "JUL 22", scope: "PLATFORM-WIDE" },
  { version: "Rate Limit Policy Update", date: "AUG 1", scope: "ALL TENANTS" },
  { version: "Advanced Analytics Module", date: "JUL 18", scope: "ENTERPRISE" },
];

const auditLog = [
  { category: "TENANT", event: "Demo Academy newly activated on platform", actor: "admin@platform.com", time: "2 hours ago" },
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
  const [signupItem, setSignupItem] = useState<(typeof recentSignups)[number] | null>(null);
  const [renewalItem, setRenewalItem] = useState<(typeof nextRenewals)[number] | null>(null);
  const [ticketItem, setTicketItem] = useState<(typeof recentTickets)[number] | null>(null);
  const [releaseItem, setReleaseItem] = useState<(typeof releaseNotes)[number] | null>(null);
  const [auditItem, setAuditItem] = useState<(typeof auditLog)[number] | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }

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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {heroMetrics.map((m) => (
          <KpiCard key={m.label} {...m} />
        ))}
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        {secondaryMetrics.map((m) => (
          <KpiCard key={m.label} {...m} className="p-4" />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
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
              <Badge variant="blue">₦284k Target</Badge>
              <Button variant="ghost" size="sm"><ChevronDown className="w-4 h-4" /></Button>
            </div>
          </div>
          <BarChart data={barData} title="Revenue" />
        </Card>
      </div>

      {/* Dynamic Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
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
                <div
                  key={item.name}
                  onClick={() => { setReviewItem(item.name); setOpen(true); }}
                  className="flex items-center justify-between py-2 border-b border-border-light last:border-0 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
                      <span className="text-primary text-xs font-semibold">{item.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-dark">{item.name}</p>
                      <p className="text-xs text-text-muted">{item.time}</p>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); setReviewItem(item.name); setOpen(true); }}>Review</Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Signups */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-dark">Recent Signups</h3>
              <Button variant="ghost" size="sm" onClick={() => showToast("Opening full list…")}>View All</Button>
            </div>
            <div className="flex flex-col gap-3">
              {recentSignups.map((item) => (
                <div
                  key={item.name}
                  onClick={() => setSignupItem(item)}
                  className="flex items-center justify-between py-2 border-b border-border-light last:border-0 cursor-pointer"
                >
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
                <div
                  key={item.name}
                  onClick={() => setRenewalItem(item)}
                  className="flex items-center justify-between py-2 border-b border-border-light last:border-0 cursor-pointer"
                >
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
            <p className="text-xl font-bold text-text-dark mb-3">₦18,200 <span className="text-xs font-normal text-text-muted">OUTSTANDING</span></p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between py-2 border-b border-border-light">
                <div>
                  <p className="text-sm font-medium text-text-dark">Demo</p>
                  <p className="text-xs text-red">DECLINED · 3D</p>
                </div>
                <span className="text-sm font-semibold text-text-dark">₦2.4k</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border-light last:border-0">
                <div>
                  <p className="text-sm font-medium text-text-dark">Pacific</p>
                  <p className="text-xs text-orange">FUNDS · 5D</p>
                </div>
                <span className="text-sm font-semibold text-text-dark">₦4.8k</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="mt-3" onClick={() => showToast("Opening full list…")}>View History</Button>
          </Card>

          {/* Recent Tickets */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-dark">Recent Tickets</h3>
              <Button variant="secondary" size="sm" onClick={() => showToast("Opening full list…")}>Support Desk</Button>
            </div>
            <div className="flex flex-col gap-3">
              {recentTickets.map((ticket) => (
                <div
                  key={ticket.title}
                  onClick={() => setTicketItem(ticket)}
                  className="flex items-center justify-between py-2 border-b border-border-light last:border-0 cursor-pointer"
                >
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
                <div
                  key={note.version}
                  onClick={() => setReleaseItem(note)}
                  className="flex items-center justify-between py-2 border-b border-border-light last:border-0 cursor-pointer"
                >
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
          <Button variant="secondary" size="sm" onClick={() => showToast("Opening full list…")}>View Full Platform Log</Button>
        </div>
        <div className="flex flex-col gap-3">
          {auditLog.map((log) => (
            <div
              key={log.event}
              onClick={() => setAuditItem(log)}
              className="flex items-center justify-between py-3 border-b border-border-light last:border-0 cursor-pointer"
            >
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

      <Modal
        open={!!signupItem}
        onClose={() => setSignupItem(null)}
        title="Recent Signup"
        subtitle={signupItem?.name}
        footer={
          <Link href="/organizations">
            <Button size="sm">Go to Organizations</Button>
          </Link>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 py-2 px-3 bg-surface rounded-lg">
            <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center">
              <span className="text-text-muted text-xs font-semibold">{signupItem ? signupItem.name[0] : ""}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-text-dark">{signupItem?.name}</p>
              <p className="text-xs text-text-muted">New organization signup</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-medium text-text-muted">Plan</span>
              <p className="text-sm text-text-dark mt-1">{signupItem?.plan}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-text-muted">Signed Up</span>
              <p className="text-sm text-text-dark mt-1">{signupItem?.date}</p>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!renewalItem}
        onClose={() => setRenewalItem(null)}
        title="Next Renewal"
        subtitle={renewalItem?.name}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => { setRenewalItem(null); showToast("Reminder sent to org admin"); }}>Send reminder</Button>
            <Button size="sm" onClick={() => { setRenewalItem(null); showToast("Subscription extended"); }}>Extend</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between py-2 px-3 bg-surface rounded-lg">
            <div>
              <p className="text-sm font-medium text-text-dark">{renewalItem?.name}</p>
              <p className="text-xs text-text-muted">{renewalItem?.plan} · {renewalItem?.date}</p>
            </div>
            <Badge variant={renewalItem?.status === "ACTIVE" ? "green" : "orange"}>{renewalItem?.status}</Badge>
          </div>
          <p className="text-xs text-text-muted">
            Review the renewal details below. Extend to push the renewal date out, or send a reminder to the organization admin.
          </p>
        </div>
      </Modal>

      <Modal
        open={!!ticketItem}
        onClose={() => setTicketItem(null)}
        title={ticketItem?.title ?? ""}
        subtitle={ticketItem?.org}
        footer={<Button size="sm" onClick={() => { setTicketItem(null); showToast("Reply drafted"); }}>Reply</Button>}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Badge variant={ticketItem?.priority === "URGENT" ? "red" : "muted"}>{ticketItem?.priority}</Badge>
            <span className="text-xs text-text-muted">{ticketItem?.category}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-medium text-text-muted">Organization</span>
              <p className="text-sm text-text-dark mt-1">{ticketItem?.org}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-text-muted">Opened</span>
              <p className="text-sm text-text-dark mt-1">{ticketItem?.time}</p>
            </div>
          </div>
          <div>
            <span className="text-xs font-medium text-text-muted">Description</span>
            <p className="text-sm text-text-dark mt-1 leading-relaxed">{ticketItem?.description}</p>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!releaseItem}
        onClose={() => setReleaseItem(null)}
        title="Release Note"
        footer={<Button variant="secondary" size="sm" onClick={() => setReleaseItem(null)}>Close</Button>}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="blue">{releaseItem?.scope}</Badge>
            <span className="text-xs text-text-muted">{releaseItem?.date}</span>
          </div>
          <div>
            <span className="text-xs font-medium text-text-muted">Version</span>
            <p className="text-sm text-text-dark mt-1">{releaseItem?.version}</p>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!auditItem}
        onClose={() => setAuditItem(null)}
        title="Audit Log Entry"
        footer={<Button variant="secondary" size="sm" onClick={() => setAuditItem(null)}>Close</Button>}
      >
        <div className="flex flex-col gap-4">
          <Badge variant={auditItem?.category === "SECURITY" ? "red" : auditItem?.category === "SUB" ? "blue" : "muted"}>{auditItem?.category}</Badge>
          <div>
            <span className="text-xs font-medium text-text-muted">Event</span>
            <p className="text-sm text-text-dark mt-1">{auditItem?.event}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-text-muted">Actor</span>
            <p className="text-sm text-text-dark mt-1">{auditItem?.actor}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-text-muted">Time</span>
            <p className="text-sm text-text-dark mt-1">{auditItem?.time}</p>
          </div>
        </div>
      </Modal>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-green text-white px-5 py-3 rounded-lg shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}
    </div>
  );
}
