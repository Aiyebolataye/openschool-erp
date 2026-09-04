"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";
import { useSubjectNotes, uid } from "@/lib/app-store";

const SUBJECTS: Record<string, { name: string; dept: string }> = {
  biology: { name: "Biology", dept: "Sciences" },
  "integrated-science": { name: "Integrated Science", dept: "Sciences" },
};

const SCHEME: Record<string, { module: string; topic: string; week: string }[]> = {
  biology: [
    { module: "M1", topic: "Cell Structure & Organelles", week: "Week 1-2" },
    { module: "M2", topic: "Cell Division: Mitosis & Meiosis", week: "Week 3-4" },
    { module: "M3", topic: "Genetics: Heredity & DNA", week: "Week 5-6" },
    { module: "M4", topic: "Evolution & Classification", week: "Week 7-8" },
    { module: "M5", topic: "Ecology & Ecosystems", week: "Week 9-10" },
    { module: "M6", topic: "Human Anatomy & Systems", week: "Week 11-12" },
  ],
};

export default function AddNotePage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const subject = SUBJECTS[id] ?? SUBJECTS["biology"];
  const scheme = SCHEME[id] ?? SCHEME["biology"];

  const [notes, setNotes] = useSubjectNotes(subject.name);

  const preselect = searchParams.get("module");
  const [module, setModule] = useState(preselect || scheme[0]?.module || "");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [assignment, setAssignment] = useState("");

  const moduleTopic = scheme.find((m) => m.module === module);

  const existing = notes.find((n) => n.module === module);

  const handleSave = () => {
    const entry = {
      id: existing?.id || uid(),
      subject: subject.name,
      module,
      title: title || `${subject.name} — ${moduleTopic?.topic || module}`,
      content,
      assignment: assignment || undefined,
      approved: existing?.approved ?? false,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };
    if (existing) {
      setNotes(notes.map((n) => (n.id === existing.id ? entry : n)));
    } else {
      setNotes([...notes, entry]);
    }
    router.push(`/teacher/subjects/${id}`);
  };

  return (
    <div className="max-w-[760px] mx-auto">
      <PageHeader
        title="Add Lesson Note"
        subtitle={`${subject.name} · ${subject.dept} Department · Term 3`}
        actions={
          <Link href={`/teacher/subjects/${id}`}>
            <Button variant="secondary">Back to Subject</Button>
          </Link>
        }
      />

      <Card className="p-6">
        <div className="flex flex-col gap-5">
          <SelectField
            label="Scheme of Work Module"
            required
            options={scheme.map((m) => `${m.module} — ${m.topic}`)}
            value={module ? scheme.find((m) => m.module === module) ? `${module} — ${moduleTopic?.topic}` : module : ""}
            onChange={(e) => {
              const val = e.target.value;
              const found = scheme.find((m) => `${m.module} — ${m.topic}` === val);
              setModule(found ? found.module : val);
            }}
            placeholder="Select module"
          />

          {moduleTopic && (
            <p className="text-xs text-text-muted -mt-2">{moduleTopic.week}</p>
          )}

          {existing && (
            <div className="rounded-lg bg-orange-light/50 border border-orange/30 px-4 py-2 text-xs text-orange">
              A note already exists for this module. Saving will update the existing note.
            </div>
          )}

          <Field label="Note Title" required>
            <TextInput placeholder={`e.g. ${moduleTopic?.topic || "Lesson title"}`} value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>

          <Field label="Note Content" required>
            <TextArea rows={8} placeholder="Write the lesson note content, learning objectives and teaching points..." value={content} onChange={(e) => setContent(e.target.value)} />
          </Field>

          <SelectField
            label="Linked Assignment (optional)"
            options={
              assignment === "None" || assignment === "" ? ["None", "Biology Essay #3 — SS1 Science", "Genetics Worksheet — SS2 Science"] : ["None", "Biology Essay #3 — SS1 Science", "Genetics Worksheet — SS2 Science"].filter((o) => o === assignment || o === "None")
            }
            value={assignment}
            onChange={(e) => setAssignment(e.target.value)}
            placeholder="Link an assignment or None"
          />

          <div className="flex items-center justify-end gap-3 border-t border-border-light pt-5">
            <Button variant="secondary" onClick={() => router.push(`/teacher/subjects/${id}`)}>Cancel</Button>
            <Button onClick={handleSave}>{existing ? "Update Note" : "Save Note"}</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
