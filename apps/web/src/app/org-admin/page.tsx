"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StatCard } from "@/components/ui/stat-card";
import { ListCard } from "@/components/ui/list-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";
import { TrendingUp } from "lucide-react";

const kpis = [
  { label: "Total Institutions", value: "12", detail: "+2 this year", detailColor: "green" as const },
  { label: "Active Institutions", value: "10", detail: "83.3%", detailColor: "green" as const },
  { label: "Total Students", value: "18,430", detail: "+340 new admissions", detailColor: "green" as const },
  { label: "Total Staff", value: "1,245", detail: "+42 this year", detailColor: "green" as const },
  { label: "Total Parents", value: "14,210", detail: "", detailColor: "muted" as const },
  { label: "Active Users", value: "9,840", detail: "", detailColor: "muted" as const },
  { label: "Outstanding Fees", value: "₦186K", detail: "Aggregate across org", detailColor: "orange" as const },
  { label: "Open Support Tickets", value: "14", detail: "3 urgent", detailColor: "red" as const },
];

const institutions = [
  { avatar: "G", avatarColor: "primary" as const, title: "Demo Academy", subtitle: "Secondary · 12,450 students · Active", right: <Badge variant="green">Healthy</Badge> },
  { avatar: "M", avatarColor: "green" as const, title: "Metropolitan Schools", subtitle: "Mixed · 8,230 students · Active", right: <Badge variant="green">Healthy</Badge> },
  { avatar: "C", avatarColor: "orange" as const, title: "Coastal Education Trust", subtitle: "Primary · 3,100 students · Trial", right: <Badge variant="orange">Trial</Badge> },
  { avatar: "P", avatarColor: "red" as const, title: "Pinnacle Learning", subtitle: "Secondary · 1,840 students · Suspended", right: <Badge variant="red">Suspended</Badge> },
];

const pendingApprovals = [
  { avatar: "R", avatarColor: "primary" as const, title: "Riverside School", subtitle: "New institution · Awaiting review", reviewTitle: "Riverside School", reviewSubtitle: "New institution application — Awaiting review" },
  { avatar: "S", avatarColor: "primary" as const, title: "Summit High School", subtitle: "Subscription upgrade request", reviewTitle: "Summit High School", reviewSubtitle: "Subscription upgrade request — Awaiting review" },
  { avatar: "V", avatarColor: "orange" as const, title: "Valley Prep School", subtitle: "Fee structure change request", reviewTitle: "Valley Prep School", reviewSubtitle: "Fee structure change request — Awaiting review" },
];

const recentActivity = [
  { avatar: "A", avatarColor: "green" as const, title: "Admission recorded", subtitle: "Demo Academy · 45 new students · 2h ago" },
  { avatar: "F", avatarColor: "primary" as const, title: "Payment received", subtitle: "Metropolitan Schools · ₦12,400 · 5h ago" },
  { avatar: "R", avatarColor: "purple" as const, title: "Results published", subtitle: "Coastal Education · SS2 term results · 1d ago" },
];

const upcomingEvents = [
  { title: "Board Executive Meeting", subtitle: "Today · 10:00 AM" },
  { title: "Institution Audit — Demo", subtitle: "Aug 5 · Campus visit" },
  { title: "Regional Directors Training", subtitle: "Aug 12 · Online" },
];

const plans = [
  { name: "Starter", price: "₦250,000", amount: "250,000" },
  { name: "Growth", price: "₦450,000", amount: "450,000" },
  { name: "Enterprise", price: "₦900,000", amount: "900,000" },
];

export default function OrgAdminDashboardPage() {
  const router = useRouter();
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewItem, setReviewItem] = useState("");
  const [addInstitutionOpen, setAddInstitutionOpen] = useState(false);
  const [newAnnouncementOpen, setNewAnnouncementOpen] = useState(false);
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [subPlan, setSubPlan] = useState("");
  const [subInstitution, setSubInstitution] = useState("");

  const [instName, setInstName] = useState("");
  const [instType, setInstType] = useState("");
  const [instAddress, setInstAddress] = useState("");
  const [instEmail, setInstEmail] = useState("");
  const [instPhone, setInstPhone] = useState("");

  const [annTitle, setAnnTitle] = useState("");
  const [annAudience, setAnnAudience] = useState("");
  const [annBody, setAnnBody] = useState("");
  const [annSchedule, setAnnSchedule] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const selectedPlan = plans.find((p) => p.name === subPlan);

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Organization Overview"
        subtitle="Consolidated view of all institutions under Metro Education Group"
        actions={
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => setAddInstitutionOpen(true)}>Add Institution</Button>
            <Button variant="secondary" onClick={() => setSubscriptionOpen(true)}>+ Add Subscription</Button>
            <Button onClick={() => setNewAnnouncementOpen(true)}>+ New Announcement</Button>
          </div>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-5 col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-text-dark">Institution Performance</h3>
              <p className="text-xs text-text-muted mt-0.5">Academic, financial and attendance summary</p>
            </div>
            <Badge variant="green"><TrendingUp className="w-3 h-3 mr-1" /> 8% up</Badge>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-surface p-4">
              <p className="text-xs text-text-muted mb-1">Academic Performance</p>
              <p className="text-xl font-bold text-text-dark">82.4%</p>
              <p className="text-xs text-green">+2.1% vs last term</p>
            </div>
            <div className="rounded-lg bg-surface p-4">
              <p className="text-xs text-text-muted mb-1">Fee Collection</p>
              <p className="text-xl font-bold text-text-dark">91.5%</p>
              <p className="text-xs text-green">+1.2% vs last month</p>
            </div>
            <div className="rounded-lg bg-surface p-4">
              <p className="text-xs text-text-muted mb-1">Attendance</p>
              <p className="text-xl font-bold text-text-dark">88.7%</p>
              <p className="text-xs text-text-muted">across all institutions</p>
            </div>
          </div>
        </Card>

        <ListCard
          title="Upcoming Events"
          items={upcomingEvents.map((e) => ({ title: e.title, subtitle: e.subtitle }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ListCard
          title="Institutions"
          subtitle="Health and subscription status"
          badge={<Badge variant="blue">12</Badge>}
          headerAction={<Button variant="ghost" size="sm" onClick={() => showToast("Opening full institution list…")}>View All</Button>}
          items={institutions.map((inst) => ({ ...inst, onClick: () => router.push("/org-admin/institutions") }))}
        />
        <div className="flex flex-col gap-4">
          <ListCard
            title="Pending Approvals"
            subtitle="Awaiting your review"
            badge={<Badge variant="orange">3 pending</Badge>}
            items={pendingApprovals.map((a) => ({
              avatar: a.avatar,
              avatarColor: a.avatarColor,
              title: a.title,
              subtitle: a.subtitle,
              action: (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setReviewItem(a.reviewTitle);
                    setReviewOpen(true);
                  }}
                >
                  Review
                </Button>
              ),
            }))}
          />
          <ListCard
            title="Recent Institution Activity"
            items={recentActivity.map((act) => ({ ...act, onClick: () => router.push("/org-admin/institutions") }))}
          />
        </div>
      </div>

      <Modal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        title={`Review — ${reviewItem}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setReviewOpen(false)}>Cancel</Button>
            <Button variant="secondary" onClick={() => { setReviewOpen(false); showToast("Request rejected"); }}>Reject</Button>
            <Button onClick={() => { setReviewOpen(false); showToast("Request approved"); }}>Approve</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-text-dark">You are reviewing the pending request from <span className="font-semibold">{reviewItem}</span>.</p>
          <p className="text-xs text-text-muted">Review the details and approve or reject this request.</p>
        </div>
      </Modal>

      <Modal
        open={addInstitutionOpen}
        onClose={() => setAddInstitutionOpen(false)}
        title="Add Institution"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddInstitutionOpen(false)}>Cancel</Button>
            <Button onClick={() => { setAddInstitutionOpen(false); setInstName(""); setInstType(""); setInstAddress(""); setInstEmail(""); setInstPhone(""); showToast("Institution added"); }}>Add Institution</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Institution Name" required>
            <TextInput placeholder="e.g. Riverside School" value={instName} onChange={(e) => setInstName(e.target.value)} />
          </Field>
          <SelectField label="Type" required placeholder="Select type" options={["Primary", "Secondary", "Mixed"]} value={instType} onChange={(e) => setInstType(e.target.value)} />
          <Field label="Address">
            <TextInput placeholder="e.g. 123 Main St, City" value={instAddress} onChange={(e) => setInstAddress(e.target.value)} />
          </Field>
          <Field label="Admin Email">
            <TextInput type="email" placeholder="admin@institution.edu" value={instEmail} onChange={(e) => setInstEmail(e.target.value)} />
          </Field>
          <Field label="Phone">
            <TextInput type="tel" placeholder="+1 234 567 890" value={instPhone} onChange={(e) => setInstPhone(e.target.value)} />
          </Field>
        </div>
      </Modal>

      <Modal
        open={newAnnouncementOpen}
        onClose={() => setNewAnnouncementOpen(false)}
        title="New Announcement"
        footer={
          <>
            <Button variant="secondary" onClick={() => setNewAnnouncementOpen(false)}>Cancel</Button>
            <Button onClick={() => { setNewAnnouncementOpen(false); setAnnTitle(""); setAnnAudience(""); setAnnBody(""); setAnnSchedule(""); showToast("Announcement scheduled"); }}>Create Announcement</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Title" required>
            <TextInput placeholder="e.g. End of Term Staff Briefing" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} />
          </Field>
          <SelectField label="Audience" required placeholder="Select audience" options={["All Staff", "Institution Admins", "Principals", "Parents", "All"]} value={annAudience} onChange={(e) => setAnnAudience(e.target.value)} />
          <Field label="Body" required>
            <TextArea rows={4} placeholder="Write your announcement message..." value={annBody} onChange={(e) => setAnnBody(e.target.value)} />
          </Field>
          <Field label="Schedule">
            <TextInput placeholder="e.g. Aug 10, 2026" value={annSchedule} onChange={(e) => setAnnSchedule(e.target.value)} />
          </Field>
        </div>
      </Modal>

      <Modal
        open={subscriptionOpen}
        onClose={() => setSubscriptionOpen(false)}
        title="Add Subscription"
        subtitle="Select an annual plan for an institution under your organization"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSubscriptionOpen(false)}>Cancel</Button>
            <Button
              disabled={!subPlan || !subInstitution}
              onClick={() => {
                const inst = subInstitution;
                setSubscriptionOpen(false);
                setSubPlan("");
                setSubInstitution("");
                showToast(`Subscription activated for ${inst}`);
              }}
            >
              Add Subscription
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Plan" required>
            <div className="grid grid-cols-3 gap-3">
              {plans.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => setSubPlan(p.name)}
                  className={`rounded-lg border p-3 text-left transition-colors ${subPlan === p.name ? "border-primary bg-primary-light/50" : "border-border-light hover:bg-surface"}`}
                >
                  <p className={`text-sm font-semibold ${subPlan === p.name ? "text-primary" : "text-text-dark"}`}>{p.name}</p>
                  <p className="text-xs text-text-dark mt-1">{p.price}</p>
                  <p className="text-[10px] text-text-muted mt-0.5">per year</p>
                </button>
              ))}
            </div>
          </Field>
          <Field label="Amount" required>
            <TextInput value={selectedPlan ? `₦${selectedPlan.amount}` : ""} placeholder="Select a plan above" readOnly />
          </Field>
          <SelectField label="Institution" required placeholder="Select institution" options={["Demo Academy", "Metropolitan Schools", "Coastal Education Trust", "Pinnacle Learning"]} value={subInstitution} onChange={(e) => setSubInstitution(e.target.value)} />
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