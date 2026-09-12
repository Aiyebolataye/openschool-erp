"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput } from "@/components/ui/form";
import { Phone, Mail, Building2, Users, Calendar, Pencil } from "lucide-react";

export default function HrOfficerProfilePage() {
  const [editOpen, setEditOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [name, setName] = useState("Mrs. Ngozi Bello");
  const [phone, setPhone] = useState("+234 810 555 1010");
  const [email, setEmail] = useState("n.bello@greenfield.edu");

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const saveProfile = () => {
    if (!name.trim() || !phone.trim() || !email.trim()) return;
    setEditOpen(false);
    showToast("Profile updated");
  };

  return (
    <div className="max-w-[800px] mx-auto">
      <PageHeader
        title="Profile"
        subtitle="Manage your HR & Payroll profile details"
        actions={
          <Button onClick={() => setEditOpen(true)}>
            <Pencil className="w-4 h-4" /> Edit Profile
          </Button>
        }
      />

      <Card className="p-6 mb-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center">
            <span className="text-primary font-semibold text-xl">NB</span>
          </div>
          <div>
            <p className="text-lg font-display font-bold text-text-dark">{name}</p>
            <p className="text-sm text-text-muted">HR & Payroll Officer · Payroll Officer</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-text-muted flex items-center gap-1">
              <Phone className="w-3 h-3" /> Phone
            </p>
            <p className="text-text-dark font-medium">{phone}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted flex items-center gap-1">
              <Mail className="w-3 h-3" /> Email
            </p>
            <p className="text-text-dark font-medium">{email}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text-dark">HR Department Details</h3>
          <Badge variant="green">Active</Badge>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-surface p-4">
            <p className="text-xs text-text-muted flex items-center gap-1">
              <Building2 className="w-3 h-3" /> Department
            </p>
            <p className="text-sm font-semibold text-text-dark mt-1">Human Resources & Payroll</p>
          </div>
          <div className="rounded-lg bg-surface p-4">
            <p className="text-xs text-text-muted">Employee ID</p>
            <p className="text-sm font-semibold text-text-dark mt-1">EMP-1010</p>
          </div>
          <div className="rounded-lg bg-surface p-4">
            <p className="text-xs text-text-muted flex items-center gap-1">
              <Users className="w-3 h-3" /> Reports To
            </p>
            <p className="text-sm font-semibold text-text-dark mt-1">School Principal</p>
          </div>
          <div className="rounded-lg bg-surface p-4">
            <p className="text-xs text-text-muted flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Joined
            </p>
            <p className="text-sm font-semibold text-text-dark mt-1">January 2019</p>
          </div>
        </div>
      </Card>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Profile"
        subtitle="Update your HR & Payroll officer details"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={saveProfile}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Full Name" required>
            <TextInput
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field label="Phone" required>
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
              placeholder="you@greenfield.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
