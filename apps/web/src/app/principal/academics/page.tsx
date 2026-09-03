"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";
import { useState } from "react";

const config = [
  { name: "Academic Levels", description: "Preschool, Primary, JSS, SSS", count: "4", manage: "Manage" },
  { name: "Sessions & Terms", description: "2026 session, 3 terms", count: "3 terms", manage: "Manage" },
  { name: "Classes", description: "JSS1–JSS3, SS1–SS3 with streams", count: "42", manage: "Manage" },
  { name: "Streams", description: "Science, Art, Commercial", count: "3", manage: "Manage" },
  { name: "Departments", description: "Sciences, Arts, Commercial, Languages", count: "4", manage: "Manage" },
  { name: "Subjects", description: "Across all levels", count: "38", manage: "Manage" },
  { name: "Timetables", description: "Class and exam timetables", count: "6", manage: "Manage" },
  { name: "Grading System", description: "A-F scale with grade points", count: "1", manage: "Manage" },
  { name: "Report Card Templates", description: "Standard report card layout", count: "2", manage: "Manage" },
  { name: "Promotion Rules", description: "Auto-promotion thresholds", count: "1", manage: "Manage" },
];

const pendingContent = [
  { title: "SS1 Biology — Lesson 12", info: "SS1 Science · Mrs. Ajayi", status: { text: "Review", variant: "orange" as const } },
  { title: "JSS2 Math — Algebra Intro", info: "JSS2 B · Mr. Obi", status: { text: "Review", variant: "orange" as const } },
  { title: "SS2 English — Poetry", info: "SS2 Art · Ms. Tran", status: { text: "Review", variant: "orange" as const } },
];

function ConfigList() {
  return (
    <Card className="divide-y divide-border-light">
      {config.map((c) => (
        <div key={c.name} className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-medium text-text-dark">{c.name}</p>
            <p className="text-xs text-text-muted mt-0.5">{c.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="blue">{c.count}</Badge>
            <Button variant="ghost" size="sm">{c.manage}</Button>
          </div>
        </div>
      ))}
    </Card>
  );
}

function ContentList({ onReview }: { onReview: () => void }) {
  return (
    <Card className="divide-y divide-border-light">
      {pendingContent.map((p) => (
        <div key={p.title} className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-medium text-text-dark">{p.title}</p>
            <p className="text-xs text-text-muted mt-0.5">{p.info}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={p.status.variant as "orange"}>{p.status.text}</Badge>
            <Button variant="secondary" size="sm" onClick={onReview}>Review</Button>
          </div>
        </div>
      ))}
    </Card>
  );
}

export default function PrincipalAcademicsPage() {
  const [addOpen, setAddOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  return (
    <div className="max-w-[1000px] mx-auto">
      <PageHeader
        title="Academics & Content"
        subtitle="Configure academic structure and manage learning content"
        actions={<Button onClick={() => setAddOpen(true)}>+ Add</Button>}
      />

      <Tabs
        tabs={[
          { id: "config", label: "Academic Configuration", content: <ConfigList /> },
          { id: "content", label: "Learning Content", content: <ContentList onReview={() => setReviewOpen(true)} /> },
        ]}
      />

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Learning Content"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => setAddOpen(false)}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Title" required>
            <TextInput placeholder="Enter content title" />
          </Field>
          <SelectField label="Subject" required placeholder="Select subject" options={["Mathematics", "English", "Biology", "Physics", "Chemistry", "Literature"]} />
          <SelectField label="Class" required placeholder="Select class" options={["JSS1 A", "JSS2 B", "SS1 Science", "SS2 Art", "SS3 Art"]} />
          <SelectField label="Type" required placeholder="Select type" options={["Lesson Note", "Video", "PPT", "Worksheet"]} />
          <Field label="Details">
            <TextArea rows={4} placeholder="Additional details about the content" />
          </Field>
        </div>
      </Modal>

      <Modal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        title="Review Content"
        footer={
          <>
            <Button variant="secondary" onClick={() => setReviewOpen(false)}>Cancel</Button>
            <Button variant="secondary" onClick={() => setReviewOpen(false)}>Reject</Button>
            <Button onClick={() => setReviewOpen(false)}>Approve</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text-dark">Review the submitted learning content and approve or reject it.</p>
          <Field label="Comments">
            <TextArea rows={3} placeholder="Add review comments (optional)" />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
