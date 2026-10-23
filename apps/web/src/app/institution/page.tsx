"use client";

import { StatCard } from "@/components/ui/stat-card";
import { ListCard } from "@/components/ui/list-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";
import { X } from "lucide-react";
import { useState } from "react";

const kpis = [
  { label: "Total Students", value: "12,450", detail: "+45 this term", detailColor: "green" as const },
  { label: "Total Staff", value: "620", detail: "", detailColor: "muted" as const },
  { label: "Active Parents", value: "10,180", detail: "", detailColor: "muted" as const },
  { label: "Active Applicants", value: "214", detail: "", detailColor: "orange" as const },
  { label: "Attendance Today", value: "88.7%", detail: "-0.8% vs avg", detailColor: "red" as const },
  { label: "Revenue This Month", value: "₦284K", detail: "+6.2%", detailColor: "green" as const },
  { label: "Outstanding Fees", value: "₦92K", detail: "312 overdue", detailColor: "orange" as const },
  { label: "Pending Results", value: "18", detail: "awaiting approval", detailColor: "orange" as const },
];

type ModalKey = "enroll" | "staff" | "payment" | "announce";

const quickActions: { title: string; subtitle: string; modal: ModalKey }[] = [
  { title: "Add Student", subtitle: "Enroll a new student", modal: "enroll" },
  { title: "Add Staff", subtitle: "Create a staff account", modal: "staff" },
  { title: "Record Payment", subtitle: "Process a fee payment", modal: "payment" },
  { title: "Publish Announcement", subtitle: "Broadcast to parents", modal: "announce" },
];

const modalActions: { label: string; desc: string; modal: ModalKey }[] = [
  { label: "Enroll Student", desc: "Add a new student record", modal: "enroll" },
  { label: "Record Payment", desc: "Process a fee payment", modal: "payment" },
  { label: "Add Staff", desc: "Create a staff account", modal: "staff" },
  { label: "New Announcement", desc: "Broadcast to parents", modal: "announce" },
];

const plans = [
  { name: "Starter", price: "₦250,000", amount: "250,000" },
  { name: "Growth", price: "₦450,000", amount: "450,000" },
  { name: "Enterprise", price: "₦900,000", amount: "900,000" },
];

const pendingApprovals = [
  { t: "Admission — Chidi Eze", subtitle: "SS1 admission · 2h ago", badge: { text: "Review", variant: "orange" as const } },
  { t: "Results — SS2 Term 2", subtitle: "12 subjects · 4h ago", badge: { text: "Review", variant: "orange" as const } },
  { t: "Fee waiver — Grace Lim", subtitle: "₦120 waiver · 1d ago", badge: { text: "Review", variant: "orange" as const } },
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

const announcements = [
  { title: "Term 3 Resumption", subtitle: "All classes resume Aug 3" },
  { title: "New Fee Payment Deadline", subtitle: "Aug 15" },
];

export default function InstitutionDashboardPage() {
  const [quickOpen, setQuickOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalKey | null>(null);
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);
  const [payRedirectOpen, setPayRedirectOpen] = useState(false);
  const [paystackOpen, setPaystackOpen] = useState(false);
  const [subPlan, setSubPlan] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const [enrollName, setEnrollName] = useState("");
  const [enrollDob, setEnrollDob] = useState("");
  const [enrollGender, setEnrollGender] = useState("");
  const [enrollClass, setEnrollClass] = useState("");
  const [enrollParentTitle, setEnrollParentTitle] = useState("");
  const [enrollGuardian, setEnrollGuardian] = useState("");
  const [enrollGuardianEmail, setEnrollGuardianEmail] = useState("");
  const [enrollGuardianPhone, setEnrollGuardianPhone] = useState("");

  const [staffName, setStaffName] = useState("");
  const [staffRole, setStaffRole] = useState("");
  const [staffDept, setStaffDept] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPhone, setStaffPhone] = useState("");

  const [payStudent, setPayStudent] = useState("");
  const [payFeeItem, setPayFeeItem] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("");

  const [annTitle, setAnnTitle] = useState("");
  const [annBody, setAnnBody] = useState("");
  const [annAudience, setAnnAudience] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const openModal = (key: ModalKey) => {
    setQuickOpen(false);
    setActiveModal(key);
  };

  const today = new Date().toISOString().slice(0, 10);
  const nextYear = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10);
  const selectedPlan = plans.find((p) => p.name === subPlan);

  const closeActiveModal = () => setActiveModal(null);

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Demo Academy Dashboard"
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
                  <p className="text-sm font-medium text-text-dark">{a.t ?? "Untitled"}</p>
                  <p className="text-xs text-text-muted">{a.subtitle ?? ""}</p>
                </div>
                <Badge variant={a.badge.variant}>{a.badge.text}</Badge>
              </div>
            ))}
          </div>
        </Card>
        <ListCard title="Upcoming Events" items={upEvents.map((e) => ({ title: e.title ?? "Untitled", subtitle: e.subtitle ?? "" }))} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <ListCard title="Recent Admissions" badge={<Badge variant="blue">3</Badge>} items={recentAdmissions} />
        <Card className="p-5 col-span-1">
          <h3 className="text-sm font-semibold text-text-dark mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((qa) => (
              <button
                key={qa.title}
                onClick={() => openModal(qa.modal)}
                className="rounded-lg border border-border-light p-3 text-left hover:bg-surface hover:border-primary/40 transition-colors"
              >
                <p className="text-sm font-medium text-text-dark">{qa.title}</p>
                <p className="text-xs text-text-muted mt-0.5">{qa.subtitle}</p>
              </button>
            ))}
          </div>
        </Card>
        <ListCard title="Institution Announcements" items={announcements.map((a) => ({ title: a.title ?? "Untitled", subtitle: a.subtitle ?? "" }))} />
      </div>

      <Modal open={quickOpen} onClose={() => setQuickOpen(false)} title="Quick Actions">
        <div className="grid grid-cols-2 gap-3">
          {modalActions.map((a) => (
            <button
              key={a.label}
              onClick={() => openModal(a.modal)}
              className="rounded-lg border border-border-light p-4 text-left hover:bg-surface hover:border-primary/40 transition-colors"
            >
              <p className="text-sm font-medium text-text-dark">{a.label}</p>
              <p className="text-xs text-text-muted mt-0.5">{a.desc}</p>
            </button>
          ))}
        </div>
      </Modal>

      <Modal
        open={activeModal === "enroll"}
        onClose={closeActiveModal}
        title="Enroll Student"
        subtitle="Add a new student record"
        footer={
          <>
            <Button variant="secondary" onClick={closeActiveModal}>Cancel</Button>
            <Button onClick={() => { closeActiveModal(); showToast("Student enrolled successfully"); }}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Student Name" required>
            <TextInput placeholder="Enter student name" value={enrollName} onChange={(e) => setEnrollName(e.target.value)} />
          </Field>
          <Field label="Date of Birth" required>
            <TextInput type="date" value={enrollDob} onChange={(e) => setEnrollDob(e.target.value)} />
          </Field>
          <SelectField label="Gender" required placeholder="Select gender" options={["Male", "Female"]} value={enrollGender} onChange={(e) => setEnrollGender(e.target.value)} />
          <SelectField label="Class" required placeholder="Select class" options={["JSS1 A", "JSS1 B", "SS1 Science", "SS2 Art", "SS1 Business"]} value={enrollClass} onChange={(e) => setEnrollClass(e.target.value)} />
          <SelectField label="Parent Title" required placeholder="Select title" options={["Mr", "Mrs", "Ms", "Dr", "Prof", "Chief", "Alhaji"]} value={enrollParentTitle} onChange={(e) => setEnrollParentTitle(e.target.value)} />
          <Field label="Guardian Name" required>
            <TextInput placeholder="Enter guardian name" value={enrollGuardian} onChange={(e) => setEnrollGuardian(e.target.value)} />
          </Field>
          <Field label="Guardian Email" required>
            <TextInput type="email" placeholder="guardian@example.com" value={enrollGuardianEmail} onChange={(e) => setEnrollGuardianEmail(e.target.value)} />
          </Field>
          <Field label="Guardian Phone" required>
            <TextInput type="tel" placeholder="+234 xxx xxx xxxx" value={enrollGuardianPhone} onChange={(e) => setEnrollGuardianPhone(e.target.value)} />
          </Field>
        </div>
      </Modal>

      <Modal
        open={activeModal === "staff"}
        onClose={closeActiveModal}
        title="Add Staff"
        subtitle="Create a staff account"
        footer={
          <>
            <Button variant="secondary" onClick={closeActiveModal}>Cancel</Button>
            <Button onClick={() => { closeActiveModal(); showToast("Staff member added successfully"); }}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Full Name" required>
            <TextInput placeholder="Enter full name" value={staffName} onChange={(e) => setStaffName(e.target.value)} />
          </Field>
          <SelectField label="Role" required placeholder="Select role" options={["Teacher", "Accountant", "Librarian", "Admin Officer", "Security"]} value={staffRole} onChange={(e) => setStaffRole(e.target.value)} />
          <SelectField label="Department" required placeholder="Select department" options={["Science", "Arts", "Business", "Administration", "Finance"]} value={staffDept} onChange={(e) => setStaffDept(e.target.value)} />
          <Field label="Email" required>
            <TextInput type="email" placeholder="staff@example.com" value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)} />
          </Field>
          <Field label="Phone" required>
            <TextInput type="tel" placeholder="+234 xxx xxx xxxx" value={staffPhone} onChange={(e) => setStaffPhone(e.target.value)} />
          </Field>
        </div>
      </Modal>

      <Modal
        open={activeModal === "payment"}
        onClose={closeActiveModal}
        title="Record Payment"
        subtitle="Process a fee payment"
        footer={
          <>
            <Button variant="secondary" onClick={closeActiveModal}>Cancel</Button>
            <Button onClick={() => { closeActiveModal(); showToast("Payment recorded successfully"); }}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField label="Student" required placeholder="Select student" options={["Chidi Eze", "Amara Okafor", "Tom Wallace", "Grace Lim", "Omar Farouk"]} value={payStudent} onChange={(e) => setPayStudent(e.target.value)} />
          <SelectField label="Fee Item" required placeholder="Select fee item" options={["Tuition", "Hostel Fee", "Examination Fee", "Sports Levy"]} value={payFeeItem} onChange={(e) => setPayFeeItem(e.target.value)} />
          <Field label="Amount" required>
            <TextInput type="number" placeholder="e.g. 250000" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
          </Field>
          <SelectField label="Method" required placeholder="Select method" options={["Card", "Bank Transfer", "Cash", "USSD"]} value={payMethod} onChange={(e) => setPayMethod(e.target.value)} />
        </div>
      </Modal>

      <Modal
        open={activeModal === "announce"}
        onClose={closeActiveModal}
        title="New Announcement"
        subtitle="Broadcast to parents"
        footer={
          <>
            <Button variant="secondary" onClick={closeActiveModal}>Cancel</Button>
            <Button onClick={() => { closeActiveModal(); showToast("Announcement published"); }}>Publish</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Title" required>
            <TextInput placeholder="Enter announcement title" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} />
          </Field>
          <Field label="Body" required>
            <TextArea rows={4} placeholder="Write your announcement..." value={annBody} onChange={(e) => setAnnBody(e.target.value)} />
          </Field>
          <SelectField label="Audience" required placeholder="Select audience" options={["All Parents", "Junior School", "Senior School", "Specific Class"]} value={annAudience} onChange={(e) => setAnnAudience(e.target.value)} />
        </div>
      </Modal>

      <Modal
        open={subscriptionOpen}
        onClose={() => setSubscriptionOpen(false)}
        title="Add Subscription"
        subtitle="Select an annual plan for this institution"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSubscriptionOpen(false)}>Cancel</Button>
            <Button disabled={!subPlan} onClick={() => { setSubscriptionOpen(false); setPayRedirectOpen(true); }}>Add Subscription</Button>
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
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Date" required>
              <TextInput value={today} readOnly />
            </Field>
            <Field label="End Date" required>
              <TextInput value={nextYear} readOnly />
            </Field>
          </div>
        </div>
      </Modal>

      <Modal
        open={payRedirectOpen}
        onClose={() => setPayRedirectOpen(false)}
        title="Payment Redirect"
        subtitle="Paystack"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPayRedirectOpen(false)}>Cancel</Button>
            <Button onClick={() => { setPayRedirectOpen(false); setPaystackOpen(true); }}>Proceed to Payment</Button>
          </>
        }
      >
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <p className="text-sm font-medium text-text-dark">Redirecting to Paystack...</p>
          <p className="text-lg font-bold text-text-dark">Total: ₦{selectedPlan?.amount}</p>
          <p className="text-xs text-text-muted">You will be taken to a secure payment page to confirm this transaction.</p>
        </div>
      </Modal>

      {paystackOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setPaystackOpen(false)} aria-hidden="true" />
          <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-text-dark">Paystack</p>
                <p className="text-xs text-text-muted">Secure payment · Total ₦{selectedPlan?.amount}</p>
              </div>
              <button onClick={() => setPaystackOpen(false)} className="p-1 rounded-md text-text-muted hover:text-text-dark hover:bg-surface transition-colors" aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="rounded-xl bg-surface border border-border-light p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-text-muted">Amount due</span>
                <span className="text-lg font-bold text-text-dark">₦{selectedPlan?.amount}</span>
              </div>
              <div className="space-y-2">
                <div className="rounded-lg border border-border-light bg-card px-3 py-2 flex items-center justify-between">
                  <span className="text-xs text-text-muted">Card number</span>
                  <span className="text-xs text-text-dark font-medium">•••• •••• •••• 4242</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-border-light bg-card px-3 py-2 flex items-center justify-between">
                    <span className="text-xs text-text-muted">Expiry</span>
                    <span className="text-xs text-text-dark font-medium">12 / 28</span>
                  </div>
                  <div className="rounded-lg border border-border-light bg-card px-3 py-2 flex items-center justify-between">
                    <span className="text-xs text-text-muted">CVV</span>
                    <span className="text-xs text-text-dark font-medium">•••</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setPaystackOpen(false)}>Cancel</Button>
              <Button className="flex-1" onClick={() => { setPaystackOpen(false); setSubPlan(""); showToast("Subscription activated"); }}>Confirm</Button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-green text-white px-5 py-3 rounded-lg shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}
    </div>
  );
}