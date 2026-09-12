"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput } from "@/components/ui/form";
import { Phone, Mail, Building2, FolderOpen, KeyRound, Pencil } from "lucide-react";

export default function PortfolioOfficerProfilePage() {
  const [editOpen, setEditOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [name, setName] = useState("Mrs. Adaeze Chukwu");
  const [phone, setPhone] = useState("+234 812 555 1122");
  const [email, setEmail] = useState("a.chukwu@greenfield.edu");

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const saveProfile = () => {
    if (!name.trim() || !phone.trim() || !email.trim()) return;
    setEditOpen(false);
    showToast("Profile updated");
  };

  const savePassword = () => {
    if (!currentPw || !newPw || newPw !== confirmPw) return;
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    showToast("Password updated");
  };

  return (
    <div className="max-w-[800px] mx-auto">
      <PageHeader
        title="Profile"
        subtitle="Manage your student management officer profile and security"
        actions={
          <Button onClick={() => setEditOpen(true)}>
            <Pencil className="w-4 h-4" /> Edit Profile
          </Button>
        }
      />

      <Card className="p-6 mb-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center">
            <span className="text-primary font-semibold text-xl">AC</span>
          </div>
          <div>
            <p className="text-lg font-display font-bold text-text-dark">{name}</p>
            <p className="text-sm text-text-muted">Student Management Officer · Greenfield Academy</p>
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
          <h3 className="text-sm font-semibold text-text-dark">Portfolio Department</h3>
          <Badge variant="green">Active</Badge>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-surface p-4">
            <p className="text-xs text-text-muted flex items-center gap-1">
              <Building2 className="w-3 h-3" /> Institution
            </p>
            <p className="text-sm font-semibold text-text-dark mt-1">Greenfield Academy</p>
          </div>
          <div className="rounded-lg bg-surface p-4">
            <p className="text-xs text-text-muted flex items-center gap-1">
              <FolderOpen className="w-3 h-3" /> Portfolios Managed
            </p>
            <p className="text-sm font-semibold text-text-dark mt-1">486 · 86% complete</p>
          </div>
          <div className="rounded-lg bg-surface p-4">
            <p className="text-xs text-text-muted">Officer</p>
            <p className="text-sm font-semibold text-text-dark mt-1">{name}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className="w-4 h-4 text-text-muted" />
          <h3 className="text-sm font-semibold text-text-dark">Change Password</h3>
        </div>
        <div className="flex flex-col gap-4 max-w-md">
          <Field label="Current Password" required>
            <TextInput
              type="password"
              placeholder="Enter current password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="New Password" required>
              <TextInput
                type="password"
                placeholder="New password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
              />
            </Field>
            <Field label="Confirm Password" required>
              <TextInput
                type="password"
                placeholder="Confirm password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
              />
            </Field>
          </div>
          <div>
            <Button variant="secondary" onClick={savePassword}>Update Password</Button>
          </div>
        </div>
      </Card>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Profile"
        subtitle="Update your student management officer details"
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