"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Field, TextInput, TextArea } from "@/components/ui/form";
import { Upload } from "lucide-react";

const docTypes = [
  { label: "National Identification Number (NIN)", key: "nin", required: true },
  { label: "Profile Photo", key: "photo", required: true },
  { label: "Teaching Certificate", key: "cert", required: false },
  { label: "CV / Resume", key: "cv", required: false },
  { label: "First School Leaving Certificate", key: "fslc", required: false },
];

export default function EditProfilePage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("Mrs. Ajayi");
  const [phone, setPhone] = useState("+234 801 234 5678");
  const [bio, setBio] = useState("");
  const [uploads, setUploads] = useState<Record<string, string>>({});

  const handleFile = (key: string, fileName: string) => {
    setUploads((prev) => ({ ...prev, [key]: fileName }));
  };

  return (
    <div className="max-w-[820px] mx-auto">
      <PageHeader
        title="Edit Profile"
        subtitle="Update your personal information and upload required documents"
        actions={
          <Link href="/teacher/profile">
            <Button variant="secondary">Back to Profile</Button>
          </Link>
        }
      />

      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-text-dark mb-4">Personal Information</h3>
          <div className="space-y-4">
            <Field label="Full Name" required>
              <TextInput value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your full name" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="School Email" required>
                <TextInput type="email" value="ajayi@greenfield.edu" disabled className="opacity-60 cursor-not-allowed" />
              </Field>
              <Field label="Phone">
                <TextInput type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234 xxx xxx xxxx" />
              </Field>
            </div>
            <Field label="Bio">
              <TextArea rows={4} placeholder="Write a short bio about yourself, qualifications, and interests..." value={bio} onChange={(e) => setBio(e.target.value)} />
            </Field>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-semibold text-text-dark mb-1">Required & Optional Documents</h3>
          <p className="text-xs text-text-muted mb-4">Upload identification, certificates, and profile documents. Required fields are marked with *. Documents with a badge are already uploaded.</p>
          <div className="flex flex-col gap-3">
            {docTypes.map((d) => (
              <div key={d.key} className="flex items-center justify-between rounded-lg border border-border-light px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-dark">{d.label}{d.required && <span className="text-red ml-0.5">*</span>}</p>
                  {uploads[d.key] ? (
                    <p className="text-xs text-green mt-0.5">Uploaded: {uploads[d.key]}</p>
                  ) : (
                    <p className="text-xs text-text-muted mt-0.5">Not yet uploaded</p>
                  )}
                </div>
                <div className="shrink-0 ml-4">
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border-light text-xs font-medium text-text-dark hover:bg-surface cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    Upload
                    <input
                      type="file"
                      className="sr-only"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFile(d.key, file.name);
                      }}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3 pb-8">
          <Button variant="secondary" onClick={() => router.push("/teacher/profile")}>Cancel</Button>
          <Button onClick={() => router.push("/teacher/profile")}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
