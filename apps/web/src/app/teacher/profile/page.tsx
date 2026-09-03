"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

const sections = [
  { title: "Personal Information", description: "Name, contact, availability" },
  { title: "Teaching Responsibilities", description: "Classrooms and subjects assigned" },
  { title: "Roles & Permissions", description: "Extra responsibilities (HOD, exam officer, etc.)" },
  { title: "Notifications", description: "Notification preferences" },
  { title: "Security", description: "Password, 2FA, sessions" },
];

export default function ProfilePage() {
  const [editOpen, setEditOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [roomDept, setRoomDept] = useState("");
  const [bio, setBio] = useState("");

  return (
    <div className="max-w-[900px] mx-auto">
      <PageHeader title="My Profile" subtitle="Manage your profile and preferences" />

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile" footer={<><Button variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Button><Button onClick={() => setEditOpen(false)}>Save</Button></>}>
        <div className="space-y-4">
          <Field label="Full Name" required><TextInput placeholder="Enter full name" value={fullName} onChange={(e) => setFullName(e.target.value)} /></Field>
          <Field label="Email" required><TextInput type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          <Field label="Phone" required><TextInput placeholder="Enter phone number" value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
          <SelectField label="Room/Department" required options={["Biology", "Chemistry", "Physics", "Mathematics", "Science Lab"]} value={roomDept} onChange={(e) => setRoomDept(e.target.value)} placeholder="Select room/department" />
          <Field label="Bio"><TextArea placeholder="Write a short bio..." rows={4} value={bio} onChange={(e) => setBio(e.target.value)} /></Field>
        </div>
      </Modal>

      <Card className="p-6 mb-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center">
          <span className="text-primary text-xl font-semibold">AA</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-text-dark">Mrs. Ajayi</h3>
          <p className="text-sm text-text-muted">Biology Teacher · Class Teacher, SS1 Science</p>
        </div>
      </Card>

      <Card className="divide-y divide-border-light">
        {sections.map((s) => (
          <div key={s.title} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-medium text-text-dark">{s.title}</p>
              <p className="text-xs text-text-muted mt-0.5">{s.description}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setEditOpen(true)}>Edit</Button>
          </div>
        ))}
      </Card>
    </div>
  );
}
