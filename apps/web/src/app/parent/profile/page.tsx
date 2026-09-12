"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";
import { Copy, Check } from "lucide-react";

const linkedChildren = [
  { name: "Chidi Eze", id: "STU-21401", className: "SS1 Science", avatar: "CE" },
  { name: "Kayode Eze", id: "STU-21411", className: "SS1 Science", avatar: "KE" },
];

export default function ParentProfilePage() {
  const [copied, setCopied] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "Mr. Eze", email: "mr.eze@greenfield.edu", phone: "+234 801 234 5678", address: "12 Adeola Odeku Street, Victoria Island, Lagos" });

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const copyPhone = () => {
    navigator.clipboard.writeText(form.phone).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const save = () => {
    setEditOpen(false);
    showToast("Profile updated");
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Profile"
        subtitle="Your guardian account details"
        actions={<Button onClick={() => setEditOpen(true)}>Edit Profile</Button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-full bg-primary-light flex items-center justify-center">
              <span className="text-primary font-semibold text-lg">ME</span>
            </div>
            <div>
              <p className="text-base font-semibold text-text-dark">{form.name}</p>
              <p className="text-xs text-text-muted">Parent / Guardian</p>
              <Badge variant="green" className="mt-1">Verified</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="block text-xs text-text-muted mb-1">Full Name</span>
              <p className="text-sm font-medium text-text-dark">{form.name}</p>
            </div>
            <div>
              <span className="block text-xs text-text-muted mb-1">Email Address</span>
              <p className="text-sm font-medium text-text-dark">{form.email}</p>
            </div>
            <div>
              <span className="block text-xs text-text-muted mb-1">Phone Number</span>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-text-dark">{form.phone}</p>
                <button onClick={copyPhone} className="text-text-muted hover:text-primary transition-colors" title="Copy">
                  {copied ? <Check className="w-4 h-4 text-green" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <span className="block text-xs text-text-muted mb-1">Address</span>
              <p className="text-sm font-medium text-text-dark">{form.address}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-text-dark mb-4">Linked Children</h3>
          <div className="flex flex-col gap-3">
            {linkedChildren.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-lg bg-surface px-4 py-3">
                <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                  <span className="text-xs font-semibold text-primary">{c.avatar}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-dark">{c.name}</p>
                  <p className="text-xs text-text-muted">{c.id} · {c.className}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5 mb-6">
        <h3 className="text-sm font-semibold text-text-dark mb-4">Change Password</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Current Password" required>
            <TextInput type="password" placeholder="••••••••" />
          </Field>
          <Field label="New Password" required>
            <TextInput type="password" placeholder="••••••••" />
          </Field>
          <Field label="Confirm New Password" required>
            <TextInput type="password" placeholder="••••••••" />
          </Field>
        </div>
        <div className="flex justify-end mt-4">
          <Button variant="secondary" onClick={() => showToast("Password change submitted for review")}>Update Password</Button>
        </div>
      </Card>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Profile"
        subtitle="Update your guardian contact information"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={save}>Save Changes</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Full Name" required>
            <TextInput value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </Field>
          <Field label="Email Address" required>
            <TextInput type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </Field>
          <Field label="Phone Number" required>
            <TextInput value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          </Field>
          <Field label="Address">
            <TextArea rows={3} value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
          </Field>
          <SelectField label="Relationship" options={["Father", "Mother", "Guardian", "Other"]} placeholder="Guardian" />
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
