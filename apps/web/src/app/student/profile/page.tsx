"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, TextInput } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { Copy, Check, Phone, Mail, Home, Pencil, Cake, Users } from "lucide-react";

export default function StudentProfilePage() {
  const [editOpen, setEditOpen] = useState(false);
  const [copiedFather, setCopiedFather] = useState(false);
  const [copiedMother, setCopiedMother] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [phone, setPhone] = useState("+234 803 555 2140");
  const [email, setEmail] = useState("chidi.eze@student.greenfield.edu.ng");
  const [address, setAddress] = useState("14 Obiagu Road, Enugu");
  const [emergency, setEmergency] = useState("+234 810 555 1001");

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const copyPhone = async (value: string, setter: (v: boolean) => void) => {
    await navigator.clipboard.writeText(value);
    setter(true);
    showToast("Phone number copied");
    setTimeout(() => setter(false), 2000);
  };

  const saveProfile = () => {
    if (!phone.trim() || !email.trim() || !address.trim() || !emergency.trim()) return;
    setEditOpen(false);
    showToast("Profile updated");
  };

  return (
    <div className="max-w-[1000px] mx-auto">
      <PageHeader
        title="My Profile"
        subtitle="Personal and academic information · Demo Academy"
        actions={
          <Button onClick={() => setEditOpen(true)}>
            <Pencil className="w-4 h-4" /> Edit Profile
          </Button>
        }
      />

      <Card className="p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-green-light flex items-center justify-center">
            <span className="text-green font-semibold text-xl">CE</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-display font-bold text-text-dark">Chidi Eze</p>
            <p className="text-sm text-text-muted">Student · SS1 Science</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Badge variant="green">Enrolled</Badge>
            <Badge variant="muted">Day student</Badge>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-surface p-4">
            <p className="text-xs text-text-muted">Student ID</p>
            <p className="text-sm font-semibold text-text-dark mt-1">STU-21401</p>
          </div>
          <div className="rounded-lg bg-surface p-4">
            <p className="text-xs text-text-muted">Admission No</p>
            <p className="text-sm font-semibold text-text-dark mt-1">ADM-2024-21401</p>
          </div>
          <div className="rounded-lg bg-surface p-4">
            <p className="text-xs text-text-muted">Class</p>
            <p className="text-sm font-semibold text-text-dark mt-1">SS1 Science</p>
          </div>
          <div className="rounded-lg bg-surface p-4">
            <p className="text-xs text-text-muted flex items-center gap-1">
              <Cake className="w-3 h-3" /> Date of Birth
            </p>
            <p className="text-sm font-semibold text-text-dark mt-1">15 March 2011</p>
          </div>
          <div className="rounded-lg bg-surface p-4">
            <p className="text-xs text-text-muted">Gender</p>
            <p className="text-sm font-semibold text-text-dark mt-1">Male</p>
          </div>
          <div className="rounded-lg bg-surface p-4">
            <p className="text-xs text-text-muted">Class Teacher</p>
            <p className="text-sm font-semibold text-text-dark mt-1">Mrs. F. Ajayi</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-text-muted" />
            <h3 className="text-sm font-semibold text-text-dark">Guardian</h3>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-lg border border-border-light p-4">
              <div>
                <p className="text-xs text-text-muted">Father</p>
                <p className="text-sm font-medium text-text-dark">Mr. Chukwuemeka Eze</p>
                <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> +234 810 555 1001
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => copyPhone("+234 810 555 1001", setCopiedFather)}>
                {copiedFather ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedFather ? "Copied" : "Copy"}
              </Button>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border-light p-4">
              <div>
                <p className="text-xs text-text-muted">Mother</p>
                <p className="text-sm font-medium text-text-dark">Mrs. Ngozi Eze</p>
                <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> +234 810 555 1002
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => copyPhone("+234 810 555 1002", setCopiedMother)}>
                {copiedMother ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedMother ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Home className="w-4 h-4 text-text-muted" />
            <h3 className="text-sm font-semibold text-text-dark">Boarding &amp; Contact</h3>
          </div>
          <div className="rounded-lg bg-green-light/50 border border-green/20 p-4 mb-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-text-dark">Day Student</p>
              <Badge variant="green">Not boarding</Badge>
            </div>
            <p className="text-xs text-text-dark leading-relaxed">
              Chidi is a day student and lives at home with his parents in Enugu. He travels to and
              from school daily on the Enugu township route.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-text-muted flex items-center gap-1">
                <Phone className="w-3 h-3" /> Student Phone
              </p>
              <p className="text-text-dark font-medium">{phone}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted flex items-center gap-1">
                <Mail className="w-3 h-3" /> Email
              </p>
              <p className="text-text-dark font-medium">{email}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-text-muted">Home Address</p>
              <p className="text-text-dark font-medium">{address}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-text-muted">Emergency Contact</p>
              <p className="text-text-dark font-medium">{emergency}</p>
            </div>
          </div>
        </Card>
      </div>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Profile"
        subtitle="Update your contact details"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={saveProfile}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Student Phone" required>
            <TextInput
              type="tel"
              placeholder="+234 xxx xxx xxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Field>
          <Field label="Email" required>
            <TextInput
              type="email"
              placeholder="you@student.greenfield.edu.ng"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Home Address" required>
            <TextInput
              placeholder="Residential address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </Field>
          <Field label="Emergency Contact" required>
            <TextInput
              type="tel"
              placeholder="+234 xxx xxx xxxx"
              value={emergency}
              onChange={(e) => setEmergency(e.target.value)}
            />
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
