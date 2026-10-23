"use client";

import { useState } from "react";
import Link from "next/link";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";
import { Stethoscope, Pill, SendHorizonal, ChevronRight, AlertTriangle } from "lucide-react";

const kpis = [
  { label: "Visits Today", value: "18", detail: "+4 vs yesterday", detailColor: "blue" as const },
  { label: "Students Treated", value: "14", detail: "of 18 seen today", detailColor: "green" as const },
  { label: "Awaiting Parents", value: "3", detail: "in the sick bay", detailColor: "orange" as const },
  { label: "Referrals This Week", value: "5", detail: "2 completed", detailColor: "red" as const },
  { label: "Bed Occupancy", value: "3 / 6", detail: "50% occupied", detailColor: "muted" as const },
  { label: "Meds Dispensed", value: "27", detail: "today", detailColor: "green" as const },
];

const todayVisits = [
  { id: "VIS-9021", student: "Adaeze Nwosu", klass: "JSS2 A", symptom: "Headache & mild fever", time: "09:40", status: { text: "Treated", variant: "green" as const } },
  { id: "VIS-9020", student: "Tunde Bakare", klass: "JSS3 A", symptom: "Sprained ankle", time: "10:15", status: { text: "Referred", variant: "red" as const } },
  { id: "VIS-9019", student: "Fatima Bello", klass: "SS1 Science", symptom: "Stomach ache", time: "11:05", status: { text: "Parent Notified", variant: "orange" as const } },
  { id: "VIS-9018", student: "Chinedu Eze", klass: "SS2 Art", symptom: "Allergic reaction", time: "12:20", status: { text: "Treated", variant: "green" as const } },
];

const lowStock = [
  { id: "MED-104", name: "Paracetamol Syrup", strength: "120mg/5ml", stock: "4 bottles", level: { text: "Low", variant: "orange" as const } },
  { id: "MED-108", name: "Ibuprofen Tablets", strength: "200mg", stock: "2 strips", level: { text: "Low", variant: "orange" as const } },
  { id: "MED-112", name: "Oral Rehydration Salts", strength: "20.5g sachet", stock: "Out of stock", level: { text: "Out", variant: "red" as const } },
];

const studentNames = [
  "Adaeze Nwosu",
  "Tunde Bakare",
  "Fatima Bello",
  "Chinedu Eze",
  "Zainab Adeyemi",
  "Ifeoma Okafor",
  "Seyi Balogun",
  "Ngozi Umeh",
  "Kemi Alade",
  "Musa Suleiman",
  "Amara Obi",
  "Damilola Ade",
];

type Visit = (typeof todayVisits)[number];

export default function ClinicAdminDashboardPage() {
  const [logVisitOpen, setLogVisitOpen] = useState(false);
  const [dispenseOpen, setDispenseOpen] = useState(false);
  const [referOpen, setReferOpen] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [lvStudent, setLvStudent] = useState("");
  const [lvSymptoms, setLvSymptoms] = useState("");
  const [lvTime, setLvTime] = useState("");
  const [lvNotes, setLvNotes] = useState("");
  const [dispMed, setDispMed] = useState("");
  const [dispStudent, setDispStudent] = useState("");
  const [dispQty, setDispQty] = useState("");
  const [refStudent, setRefStudent] = useState("");
  const [refTo, setRefTo] = useState("");
  const [refReason, setRefReason] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const saveLogVisit = () => {
    if (!lvStudent || !lvSymptoms) return;
    setLogVisitOpen(false);
    setLvStudent("");
    setLvSymptoms("");
    setLvTime("");
    setLvNotes("");
    showToast("Visit logged");
  };

  const saveDispense = () => {
    if (!dispMed || !dispStudent || !dispQty) return;
    setDispenseOpen(false);
    setDispMed("");
    setDispStudent("");
    setDispQty("");
    showToast("Medication dispensed");
  };

  const saveRefer = () => {
    if (!refStudent || !refTo || !refReason) return;
    setReferOpen(false);
    setRefStudent("");
    setRefTo("");
    setRefReason("");
    showToast("Referral submitted");
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Sick Bay Overview"
        subtitle="Clinic dashboard · Nurse Adaeze Okafor · 18 visits today"
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <Card className="p-5 mb-6">
        <h3 className="text-sm font-semibold text-text-dark mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setLogVisitOpen(true)}>
            <Stethoscope className="w-4 h-4" /> Log Visit
          </Button>
          <Button variant="secondary" onClick={() => setDispenseOpen(true)}>
            <Pill className="w-4 h-4" /> Dispense Med
          </Button>
          <Button variant="secondary" onClick={() => setReferOpen(true)}>
            <SendHorizonal className="w-4 h-4" /> Refer Student
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="text-sm font-semibold text-text-dark mb-2">Today&apos;s Visits</h3>
          <Card className="divide-y divide-border-light">
            {todayVisits.map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  setSelectedVisit(v);
                  setVisitOpen(true);
                }}
                className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-surface/60 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-dark">{v.student}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {v.symptom} · {v.time}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={v.status.variant}>{v.status.text}</Badge>
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                </div>
              </button>
            ))}
            <Link
              href="/clinic-admin/visits"
              className="block text-center text-xs font-medium text-primary hover:underline py-3"
            >
              View all visits →
            </Link>
          </Card>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-text-dark mb-2">Low Stock Alerts</h3>
          <Card className="divide-y divide-border-light">
            {lowStock.map((m) => (
              <div key={m.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-dark">{m.name}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {m.strength} · {m.stock}
                  </p>
                </div>
                <Badge variant={m.level.variant}>{m.level.text}</Badge>
              </div>
            ))}
            <Link
              href="/clinic-admin/medications"
              className="block text-center text-xs font-medium text-primary hover:underline py-3"
            >
              Manage medications →
            </Link>
          </Card>
        </div>
      </div>

      <Modal
        open={logVisitOpen}
        onClose={() => setLogVisitOpen(false)}
        title="Log Visit"
        subtitle="Record a new sick bay visit"
        footer={
          <>
            <Button variant="secondary" onClick={() => setLogVisitOpen(false)}>Cancel</Button>
            <Button onClick={saveLogVisit}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField
            label="Student"
            required
            placeholder="Select student"
            options={studentNames}
            value={lvStudent}
            onChange={(e) => setLvStudent(e.target.value)}
          />
          <Field label="Symptoms" required>
            <TextArea
              rows={3}
              placeholder="Describe the symptoms"
              value={lvSymptoms}
              onChange={(e) => setLvSymptoms(e.target.value)}
            />
          </Field>
          <Field label="Visit Time">
            <TextInput type="time" value={lvTime} onChange={(e) => setLvTime(e.target.value)} />
          </Field>
          <Field label="Treatment Notes">
            <TextArea
              rows={3}
              placeholder="Notes on treatment given"
              value={lvNotes}
              onChange={(e) => setLvNotes(e.target.value)}
            />
          </Field>
        </div>
      </Modal>

      <Modal
        open={dispenseOpen}
        onClose={() => setDispenseOpen(false)}
        title="Dispense Medication"
        subtitle="Log a medication dispensed to a student"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDispenseOpen(false)}>Cancel</Button>
            <Button onClick={saveDispense}>Dispense</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField
            label="Medication"
            required
            placeholder="Select medication"
            options={["Paracetamol Syrup", "Ibuprofen Tablets", "Antimalarial", "Cough Syrup"]}
            value={dispMed}
            onChange={(e) => setDispMed(e.target.value)}
          />
          <SelectField
            label="Student"
            required
            placeholder="Select student"
            options={studentNames}
            value={dispStudent}
            onChange={(e) => setDispStudent(e.target.value)}
          />
          <Field label="Quantity" required>
            <TextInput
              placeholder="e.g. 10ml, 2 tablets"
              value={dispQty}
              onChange={(e) => setDispQty(e.target.value)}
            />
          </Field>
        </div>
      </Modal>

      <Modal
        open={referOpen}
        onClose={() => setReferOpen(false)}
        title="Refer Student"
        subtitle="Refer a student to a clinic or hospital"
        footer={
          <>
            <Button variant="secondary" onClick={() => setReferOpen(false)}>Cancel</Button>
            <Button onClick={saveRefer}>Submit Referral</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField
            label="Student"
            required
            placeholder="Select student"
            options={studentNames}
            value={refStudent}
            onChange={(e) => setRefStudent(e.target.value)}
          />
          <SelectField
            label="Refer To"
            required
            placeholder="Select destination"
            options={["Demo Clinic", "St. Mary&apos;s Hospital", "University Teaching Hospital", "Local Health Center"]}
            value={refTo}
            onChange={(e) => setRefTo(e.target.value)}
          />
          <Field label="Reason" required>
            <TextArea
              rows={3}
              placeholder="Reason for referral"
              value={refReason}
              onChange={(e) => setRefReason(e.target.value)}
            />
          </Field>
        </div>
      </Modal>

      <Modal
        open={visitOpen}
        onClose={() => setVisitOpen(false)}
        title={selectedVisit?.student ?? ""}
        subtitle={selectedVisit ? `${selectedVisit.id} · ${selectedVisit.klass}` : undefined}
      >
        {selectedVisit && (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-border-light p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-text-muted">Symptoms</p>
                <p className="text-sm font-medium text-text-dark">{selectedVisit.symptom}</p>
              </div>
              <Badge variant={selectedVisit.status.variant}>{selectedVisit.status.text}</Badge>
            </div>
            <p className="text-sm text-text-dark">
              <span className="font-medium">{selectedVisit.student}</span> visited the sick bay at{" "}
              <span className="font-medium">{selectedVisit.time}</span> with {selectedVisit.symptom.toLowerCase()}.
            </p>
          </div>
        )}
      </Modal>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-green text-white px-5 py-3 rounded-lg shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}
    </div>
  );
}
