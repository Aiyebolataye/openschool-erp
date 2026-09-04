"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";
import { useState } from "react";

export default function PrincipalProfilePage() {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="max-w-[800px] mx-auto">
      <PageHeader
        title="My Profile"
        subtitle="Manage your profile, preferences, and required documents"
        actions={<Button onClick={() => setEditOpen(true)}>Edit</Button>}
      />

      <Card className="p-6 mb-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center">
            <span className="text-primary font-semibold text-xl">DO</span>
          </div>
          <div>
            <p className="text-lg font-display font-bold text-text-dark">Dr. Okon</p>
            <p className="text-sm text-text-muted">Principal · Greenfield Academy</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-text-muted">School Email</p>
            <p className="text-text-dark font-medium">d.okon@greenfield.edu</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Personal Email</p>
            <p className="text-text-dark font-medium">dokon@example.com</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-text-dark">Required Documents</h3>
            <p className="text-xs text-text-muted mt-0.5">Documents required before full account access</p>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between rounded-lg border border-border-light px-4 py-3">
            <div>
              <p className="text-sm font-medium text-text-dark">National Identification Number (NIN)</p>
              <p className="text-xs text-text-muted mt-0.5">Uploaded · Verified</p>
            </div>
            <Badge variant="green">Complete</Badge>
          </div>
        </div>
      </Card>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Profile"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={() => setEditOpen(false)}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Full Name" required>
            <TextInput placeholder="Enter your name" />
          </Field>
          <Field label="School Email" required>
            <TextInput type="email" value="d.okon@greenfield.edu" disabled className="opacity-60 cursor-not-allowed" />
          </Field>
          <Field label="Personal Email" required>
            <TextInput type="email" placeholder="you@example.com" />
          </Field>
          <Field label="Phone">
            <TextInput type="tel" placeholder="+234 xxx xxx xxxx" />
          </Field>
          <Field label="Bio">
            <TextArea rows={3} placeholder="Short bio" />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
