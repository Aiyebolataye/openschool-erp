"use client";

import { useState } from "react";
import Link from "next/link";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, SelectField } from "@/components/ui/form";
import { Award, FileBadge, ChevronRight } from "lucide-react";

const kpis = [
  { label: "Portfolios Updated", value: "12", detail: "this term", detailColor: "blue" as const },
  { label: "Certificates Issued", value: "48", detail: "+5 this week", detailColor: "green" as const },
  { label: "Achievements", value: "73", detail: "all categories", detailColor: "muted" as const },
  { label: "Pending Reviews", value: "7", detail: "awaiting review", detailColor: "orange" as const },
  { label: "Missing Portfolio", value: "3", detail: "need follow-up", detailColor: "red" as const },
  { label: "Completion Rate", value: "86%", detail: "+4% vs last term", detailColor: "green" as const },
];

const recentUpdates = [
  { id: "UPD-2101", student: "Ngozi Okonkwo", klass: "SS3 Art", item: "Added WAEC certificate", time: "2h ago", type: { text: "Certificate", variant: "blue" as const } },
  { id: "UPD-2100", student: "Tobi Adeyemi", klass: "SS2 Science", item: "Updated academic records", time: "4h ago", type: { text: "Record", variant: "green" as const } },
  { id: "UPD-2099", student: "Blessing Eze", klass: "JSS2 A", item: "Added athletics medal", time: "1d ago", type: { text: "Achievement", variant: "purple" as const } },
  { id: "UPD-2098", student: "Femi Balogun", klass: "SS3 Science", item: "Added debating prize", time: "1d ago", type: { text: "Achievement", variant: "purple" as const } },
  { id: "UPD-2097", student: "Chiamaka Nwankwo", klass: "SS1 Art", item: "Added art exhibition certificate", time: "2d ago", type: { text: "Certificate", variant: "blue" as const } },
];

const pendingReviews = [
  { id: "REV-118", student: "Ngozi Okonkwo", klass: "SS3 Art", time: "submitted 1d ago", status: { text: "Pending", variant: "orange" as const } },
  { id: "REV-117", student: "Ibrahim Lawal", klass: "SS2 Science", time: "submitted 2d ago", status: { text: "Pending", variant: "orange" as const } },
  { id: "REV-116", student: "Adaobi Nwachukwu", klass: "SS2 Art", time: "submitted 3d ago", status: { text: "Needs update", variant: "red" as const } },
];

const studentOptions = [
  "Ngozi Okonkwo",
  "Tobi Adeyemi",
  "Zainab Abubakar",
  "Emeka Okafor",
  "Blessing Eze",
  "Femi Balogun",
  "Chiamaka Nwankwo",
  "Ibrahim Lawal",
  "Yemi Osho",
  "Adaobi Nwachukwu",
];

export default function StudentManagementDashboardPage() {
  const [certOpen, setCertOpen] = useState(false);
  const [achvOpen, setAchvOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [certStudent, setCertStudent] = useState("");
  const [certTitle, setCertTitle] = useState("");
  const [certType, setCertType] = useState("");
  const [certDate, setCertDate] = useState("");

  const [achvStudent, setAchvStudent] = useState("");
  const [achvTitle, setAchvTitle] = useState("");
  const [achvCategory, setAchvCategory] = useState("");
  const [achvDate, setAchvDate] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const saveCertificate = () => {
    if (!certStudent || !certTitle || !certType || !certDate) return;
    setCertOpen(false);
    setCertStudent("");
    setCertTitle("");
    setCertType("");
    setCertDate("");
    showToast(`Certificate issued to ${certStudent}`);
  };

  const saveAchievement = () => {
    if (!achvStudent || !achvTitle || !achvCategory || !achvDate) return;
    setAchvOpen(false);
    setAchvStudent("");
    setAchvTitle("");
    setAchvCategory("");
    setAchvDate("");
    showToast(`Achievement added for ${achvStudent}`);
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Portfolio Overview"
        subtitle="Student records · academic portfolios, certificates, achievements & skills"
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <Card className="p-5 mb-6">
        <h3 className="text-sm font-semibold text-text-dark mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setCertOpen(true)}>
            <FileBadge className="w-4 h-4" /> Add Certificate
          </Button>
          <Button variant="secondary" onClick={() => setAchvOpen(true)}>
            <Award className="w-4 h-4" /> Add Achievement
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="text-sm font-semibold text-text-dark mb-2">Recent Updates</h3>
          <Card className="divide-y divide-border-light">
            {recentUpdates.map((u) => (
              <button
                key={u.id}
                onClick={() => showToast(`Opened update for ${u.student} — ${u.item}`)}
                className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-surface/60 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-dark">{u.student}</p>
                  <p className="text-xs text-text-muted mt-0.5 truncate">
                    {u.item} · {u.klass} · {u.time}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={u.type.variant}>{u.type.text}</Badge>
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                </div>
              </button>
            ))}
            <Link
              href="/student-management/students"
              className="block text-center text-xs font-medium text-primary hover:underline py-3"
            >
              View all portfolios →
            </Link>
          </Card>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-text-dark mb-2">Pending Reviews</h3>
          <Card className="divide-y divide-border-light">
            {pendingReviews.map((r) => (
              <button
                key={r.id}
                onClick={() => showToast(`Opening review for ${r.student}`)}
                className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-surface/60 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-dark">{r.student}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {r.klass} · {r.time}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={r.status.variant}>{r.status.text}</Badge>
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                </div>
              </button>
            ))}
            <Link
              href="/student-management/reviews"
              className="block text-center text-xs font-medium text-primary hover:underline py-3"
            >
              View all reviews →
            </Link>
          </Card>
        </div>
      </div>

      <Modal
        open={certOpen}
        onClose={() => setCertOpen(false)}
        title="Add Certificate"
        subtitle="Issue a new certificate to a student's portfolio"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCertOpen(false)}>Cancel</Button>
            <Button onClick={saveCertificate}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField
            label="Student"
            required
            placeholder="Select student"
            options={studentOptions}
            value={certStudent}
            onChange={(e) => setCertStudent(e.target.value)}
          />
          <Field label="Certificate Title" required>
            <TextInput
              placeholder="e.g. WAEC SSCE Certificate"
              value={certTitle}
              onChange={(e) => setCertTitle(e.target.value)}
            />
          </Field>
          <SelectField
            label="Type"
            required
            placeholder="Select type"
            options={["Academic", "Skills", "Participation", "Behaviour", "External"]}
            value={certType}
            onChange={(e) => setCertType(e.target.value)}
          />
          <Field label="Issue Date" required>
            <TextInput type="date" value={certDate} onChange={(e) => setCertDate(e.target.value)} />
          </Field>
        </div>
      </Modal>

      <Modal
        open={achvOpen}
        onClose={() => setAchvOpen(false)}
        title="Add Achievement"
        subtitle="Record a new achievement in a student's portfolio"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAchvOpen(false)}>Cancel</Button>
            <Button onClick={saveAchievement}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField
            label="Student"
            required
            placeholder="Select student"
            options={studentOptions}
            value={achvStudent}
            onChange={(e) => setAchvStudent(e.target.value)}
          />
          <Field label="Achievement" required>
            <TextInput
              placeholder="e.g. 1st Place, Inter-House Athletics"
              value={achvTitle}
              onChange={(e) => setAchvTitle(e.target.value)}
            />
          </Field>
          <SelectField
            label="Category"
            required
            placeholder="Select category"
            options={["Academic", "Sports", "Arts", "Community"]}
            value={achvCategory}
            onChange={(e) => setAchvCategory(e.target.value)}
          />
          <Field label="Date" required>
            <TextInput type="date" value={achvDate} onChange={(e) => setAchvDate(e.target.value)} />
          </Field>
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