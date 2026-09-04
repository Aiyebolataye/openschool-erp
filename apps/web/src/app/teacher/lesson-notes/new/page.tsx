"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";
import { useSubjectNotes, uid } from "@/lib/app-store";

const SUBJECTS: Record<string, { name: string; dept: string; modules: { module: string; topic: string; week: string }[] }> = {
  biology: {
    name: "Biology",
    dept: "Sciences",
    modules: [
      { module: "M1", topic: "Cell Structure & Organelles", week: "Week 1-2" },
      { module: "M2", topic: "Cell Division: Mitosis & Meiosis", week: "Week 3-4" },
      { module: "M3", topic: "Genetics: Heredity & DNA", week: "Week 5-6" },
      { module: "M4", topic: "Evolution & Classification", week: "Week 7-8" },
    ],
  },
  "integrated-science": {
    name: "Integrated Science",
    dept: "Sciences",
    modules: [
      { module: "M1", topic: "Introduction to Science", week: "Week 1-2" },
      { module: "M2", topic: "Matter & Energy", week: "Week 3-4" },
      { module: "M3", topic: "Living & Non-living Things", week: "Week 5-6" },
    ],
  },
};

export default function NewLessonNotePage() {
  const router = useRouter();
  const [subject, setSubject] = useState("biology");
  const subj = SUBJECTS[subject] ?? SUBJECTS["biology"];
  const [module, setModule] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [assignedClass, setAssignedClass] = useState("");

  const [notes, setNotes] = useSubjectNotes(subj.name);

  const moduleTopic = subj.modules.find((m) => m.module === module);
  const existing = notes.find((n) => n.module === module);

  const handleSave = () => {
    const entry = {
      id: existing?.id || uid(),
      subject: subj.name,
      module,
      title: title || (moduleTopic ? `${subj.name} — ${moduleTopic.topic}` : `${subj.name} — Lesson Note`),
      content,
      assignment: undefined,
      approved: existing?.approved ?? false,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };
    if (existing) {
      setNotes(notes.map((n) => (n.id === existing.id ? entry : n)));
    } else {
      setNotes([...notes, entry]);
    }
    router.push("/teacher");
  };

  return (
    <div className="max-w-[820px] mx-auto">
      <PageHeader
        title="Add Lesson Note"
        subtitle="Record a lesson note against your scheme of work · pending head teacher approval"
        actions={
          <Link href="/teacher">
            <Button variant="secondary">Back to Dashboard</Button>
          </Link>
        }
      />

      <Card className="p-6">
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Subject"
              required
              options={Object.keys(SUBJECTS)}
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setModule("");
              }}
            />
            <SelectField
              label="Class"
              required
              options={["SS1 Science", "SS2 Science", "SS3 Science"]}
              value={assignedClass}
              onChange={(e) => setAssignedClass(e.target.value)}
              placeholder="Select class"
            />
          </div>

          <SelectField
            label="Scheme of Work Module"
            required
            options={subj.modules.map((m) => `${m.module} — ${m.topic}`)}
            value={module ? (moduleTopic ? `${module} — ${moduleTopic.topic}` : module) : ""}
            onChange={(e) => {
              const val = e.target.value;
              const found = subj.modules.find((m) => `${m.module} — ${m.topic}` === val);
              setModule(found ? found.module : val);
            }}
            placeholder="Select module"
          />

          {moduleTopic && <p className="text-xs text-text-muted -mt-2">{moduleTopic.week}</p>}

          {existing && (
            <div className="rounded-lg bg-orange-light/50 border border-orange/30 px-4 py-2 text-xs text-orange">
              A lesson note already exists for this module and is awaiting approval. Update or save to overwrite it.
            </div>
          )}

          <Field label="Lesson Title" required>
            <TextInput placeholder={moduleTopic ? `e.g. ${moduleTopic.topic}` : "Lesson title"} value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>

          <Field label="Lesson Content" required>
            <TextArea rows={10} placeholder="Write the lesson note content, learning objectives, teaching points and activities..." value={content} onChange={(e) => setContent(e.target.value)} />
          </Field>

          <div className="flex items-center justify-end gap-3 border-t border-border-light pt-5">
            <Button variant="secondary" onClick={() => router.push("/teacher")}>Cancel</Button>
            <Button onClick={handleSave}>{existing ? "Update Lesson Note" : "Save Lesson Note"}</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
