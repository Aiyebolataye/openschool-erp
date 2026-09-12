"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput } from "@/components/ui/form";
import { Phone, Mail, Bus, MapPin, Users, Fuel, Pencil } from "lucide-react";

export default function TransportManagerProfilePage() {
  const [editOpen, setEditOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [name, setName] = useState("Mr. Musa Idris");
  const [phone, setPhone] = useState("+234 803 555 0221");
  const [email, setEmail] = useState("m.idris@greenfield.edu");

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
        subtitle="Manage your transport manager profile and department details"
        actions={
          <Button onClick={() => setEditOpen(true)}>
            <Pencil className="w-4 h-4" /> Edit Profile
          </Button>
        }
      />

      <Card className="p-6 mb-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center">
            <span className="text-primary font-semibold text-xl">MI</span>
          </div>
          <div>
            <p className="text-lg font-display font-bold text-text-dark">{name}</p>
            <p className="text-sm text-text-muted">Transport Manager · Greenfield Academy</p>
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
          <h3 className="text-sm font-semibold text-text-dark">Transport Department</h3>
          <Badge variant="green">Operational</Badge>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-surface p-4">
            <p className="text-xs text-text-muted flex items-center gap-1">
              <Bus className="w-3 h-3" /> Fleet
            </p>
            <p className="text-sm font-semibold text-text-dark mt-1">18 buses</p>
          </div>
          <div className="rounded-lg bg-surface p-4">
            <p className="text-xs text-text-muted flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Routes Covered
            </p>
            <p className="text-sm font-semibold text-text-dark mt-1">14 routes</p>
          </div>
          <div className="rounded-lg bg-surface p-4">
            <p className="text-xs text-text-muted flex items-center gap-1">
              <Users className="w-3 h-3" /> Drivers & Staff
            </p>
            <p className="text-sm font-semibold text-text-dark mt-1">26 staff</p>
          </div>
          <div className="rounded-lg bg-surface p-4">
            <p className="text-xs text-text-muted flex items-center gap-1">
              <Fuel className="w-3 h-3" /> Fuel Budget
            </p>
            <p className="text-sm font-semibold text-text-dark mt-1">₦1.24M / month</p>
          </div>
          <div className="rounded-lg bg-surface p-4">
            <p className="text-xs text-text-muted">Garage Base</p>
            <p className="text-sm font-semibold text-text-dark mt-1">Main Motor Park</p>
          </div>
          <div className="rounded-lg bg-surface p-4">
            <p className="text-xs text-text-muted">Office</p>
            <p className="text-sm font-semibold text-text-dark mt-1">Admin Block · Wing B</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text-dark">Contact Directory</h3>
          <Badge variant="blue">Internal</Badge>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="rounded-lg border border-border-light p-4">
            <p className="text-xs text-text-muted">Garage / Workshop</p>
            <p className="text-text-dark font-medium">+234 809 555 0300</p>
            <p className="text-xs text-text-muted mt-0.5">Mr. Tunde Bakare · Chief Mechanic</p>
          </div>
          <div className="rounded-lg border border-border-light p-4">
            <p className="text-xs text-text-muted">Dispatch Office</p>
            <p className="text-text-dark font-medium">+234 809 555 0311</p>
            <p className="text-xs text-text-muted mt-0.5">Mrs. Amina Bello · Dispatcher</p>
          </div>
        </div>
      </Card>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Profile"
        subtitle="Update your transport manager details"
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