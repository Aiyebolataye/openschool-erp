"use client";

import Link from "next/link";
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
  return (
    <div className="max-w-[900px] mx-auto">
      <PageHeader
        title="My Profile"
        subtitle="Manage your profile and preferences"
        actions={
          <Link href="/teacher/profile/edit">
            <Button>Edit Profile</Button>
          </Link>
        }
      />

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
            <Link href="/teacher/profile/edit">
              <Button variant="ghost" size="sm">Edit</Button>
            </Link>
          </div>
        ))}
      </Card>
    </div>
  );
}
