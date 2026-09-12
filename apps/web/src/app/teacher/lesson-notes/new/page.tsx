"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";
import { Bold, Italic, Underline, List, ListOrdered, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubjectNotes, useSubjectAssignments, uid } from "@/lib/app-store";

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

const CLASSES = ["SS1 Science", "SS2 Science", "SS3 Science"];

function ToolbarButton({ onPress, children }: { onPress: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onPress}
      className="h-7 w-7 flex items-center justify-center rounded text-text-dark hover:bg-border-light/50"
    >
      {children}
    </button>
  );
}

export default function NewLessonNotePage() {
  const router = useRouter();
  const [subject, setSubject] = useState("biology");
  const subj = SUBJECTS[subject] ?? SUBJECTS["biology"];
  const [module, setModule] = useState("");
  const [title, setTitle] = useState("");
  const [subtopics, setSubtopics] = useState<{ title: string; body: string }[]>([{ title: "", body: "" }]);
  const [content, setContent] = useState("");
  const [assignedClass, setAssignedClass] = useState("");

  const [assignmentMode, setAssignmentMode] = useState<"create" | "link">("create");
  const [assignTitle, setAssignTitle] = useState("");
  const [assignClass, setAssignClass] = useState("");
  const [assignDue, setAssignDue] = useState("");
  const [assignInstructions, setAssignInstructions] = useState("");
  const [linkedAssignment, setLinkedAssignment] = useState("");

  const [notes, setNotes] = useSubjectNotes(subj.name);
  const [assignments, setAssignments] = useSubjectAssignments(subj.name);

  const editorRef = useRef<HTMLDivElement>(null);

  const moduleTopic = subj.modules.find((m) => m.module === module);
  const existing = notes.find((n) => n.module === module);

  const addSubtopic = () => setSubtopics((prev) => [...prev, { title: "", body: "" }]);
  const removeSubtopic = (index: number) => setSubtopics((prev) => prev.filter((_, i) => i !== index));
  const changeSubtopic = (index: number, patch: Partial<{ title: string; body: string }>) =>
    setSubtopics((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));

  const exec = (command: string, value?: string) => {
    try {
      document.execCommand(command, false, value);
    } catch {}
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const syncContent = () => {
    if (editorRef.current) setContent(editorRef.current.innerHTML);
  };

  const resetEditor = () => {
    if (editorRef.current) editorRef.current.innerHTML = "";
  };

  useEffect(() => {
    if (!existing) return;
    setTitle(existing.title);
    setSubtopics(
      existing.subtopics && existing.subtopics.length > 0
        ? existing.subtopics.map((s) => (typeof s === "string" ? { title: s, body: "" } : { title: s.title ?? "", body: s.body ?? "" }))
        : [{ title: "", body: "" }]
    );
    setContent(existing.content);
    if (editorRef.current) editorRef.current.innerHTML = existing.content;
  }, [existing]);

  const saveAssignmentDraft = () => {
    const entryTitle = assignTitle.trim() || "Untitled Assignment";
    setAssignments([
      ...assignments,
      {
        id: uid(),
        subject: subj.name,
        title: entryTitle,
        cls: assignClass,
        due: assignDue,
        instructions: assignInstructions,
        status: "pending",
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      },
    ]);
    setAssignTitle(entryTitle);
    setAssignDue("");
    setAssignInstructions("");
  };

  const handleSave = () => {
    const assignment = assignmentMode === "link" ? linkedAssignment || undefined : assignTitle.trim() || undefined;
    const entry = {
      id: existing?.id || uid(),
      subject: subj.name,
      module,
      title: title || (moduleTopic ? `${subj.name} — ${moduleTopic.topic}` : `${subj.name} — Lesson Note`),
      subtopics: subtopics.map((s) => ({ title: s.title.trim(), body: s.body })).filter((s) => s.title || s.body),
      content,
      assignment,
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
                setTitle("");
                setSubtopics([{ title: "", body: "" }]);
                setContent("");
                resetEditor();
              }}
            />
            <SelectField
              label="Class"
              required
              options={CLASSES}
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
              setTitle("");
              setSubtopics([{ title: "", body: "" }]);
              setContent("");
              resetEditor();
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

          <div>
            <span className="block text-xs font-medium text-text-dark mb-1.5">Subtopics</span>
            <div className="flex flex-col gap-2">
              {subtopics.length === 0 && <p className="text-xs text-text-muted">No subtopics yet — add one below.</p>}
              {subtopics.map((sub, i) => (
                <div key={i} className="relative rounded-lg border border-border-light bg-surface/40 p-4 pr-10">
                  <button
                    type="button"
                    onClick={() => removeSubtopic(i)}
                    aria-label={`Remove subtopic ${i + 1}`}
                    className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-md border border-border-light text-text-muted transition-colors hover:border-red/40 hover:text-red"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="flex flex-col gap-3">
                    <Field label="Subtopic title">
                      <TextInput
                        placeholder={i === 0 ? "e.g. Structure of the plant cell" : "e.g. Nucleus & organelles"}
                        value={sub.title}
                        onChange={(e) => changeSubtopic(i, { title: e.target.value })}
                      />
                    </Field>
                    <Field label="Content">
                      <TextArea
                        rows={3}
                        placeholder="Write the note content for this subtopic..."
                        value={sub.body}
                        onChange={(e) => changeSubtopic(i, { body: e.target.value })}
                      />
                    </Field>
                  </div>
                </div>
              ))}
              <div>
                <Button type="button" variant="secondary" size="sm" onClick={addSubtopic}>
                  <Plus className="h-4 w-4" /> Add Subtopic
                </Button>
              </div>
            </div>
          </div>

          <Field label="Lesson Content" required>
            <div className="rounded-lg border border-border-light bg-card overflow-hidden">
              <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border-light bg-surface">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => exec("formatBlock", "H1")}
                  className="h-7 px-2 rounded text-xs font-bold text-text-dark hover:bg-border-light/50"
                >
                  H1
                </button>
                <ToolbarButton onPress={() => exec("bold")}>
                  <Bold className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onPress={() => exec("italic")}>
                  <Italic className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onPress={() => exec("underline")}>
                  <Underline className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onPress={() => exec("insertUnorderedList")}>
                  <List className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onPress={() => exec("insertOrderedList")}>
                  <ListOrdered className="w-4 h-4" />
                </ToolbarButton>
              </div>
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={syncContent}
                className="min-h-[200px] px-3 py-2 text-sm text-text-dark outline-none [&_h1]:text-xl [&_h1]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
              />
            </div>
          </Field>

          <div className="rounded-lg border border-border-light p-4">
            <p className="text-sm font-semibold text-text-dark mb-3">Assignment</p>
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setAssignmentMode("create")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  assignmentMode === "create" ? "bg-primary text-white" : "bg-surface text-text-muted hover:text-text-dark"
                )}
              >
                Create new assignment
              </button>
              <button
                type="button"
                onClick={() => setAssignmentMode("link")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  assignmentMode === "link" ? "bg-primary text-white" : "bg-surface text-text-muted hover:text-text-dark"
                )}
              >
                Link existing assignment
              </button>
            </div>

            {assignmentMode === "create" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Title">
                    <TextInput placeholder="e.g. Genetics Worksheet" value={assignTitle} onChange={(e) => setAssignTitle(e.target.value)} />
                  </Field>
                  <SelectField
                    label="Class"
                    options={CLASSES}
                    value={assignClass}
                    onChange={(e) => setAssignClass(e.target.value)}
                    placeholder="Select class"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Due Date">
                    <TextInput type="date" value={assignDue} onChange={(e) => setAssignDue(e.target.value)} />
                  </Field>
                  <div className="flex items-end justify-end gap-2">
                    {assignTitle && <p className="text-xs text-green pb-2">Draft saved: {assignTitle}</p>}
                    <Button variant="secondary" size="sm" onClick={saveAssignmentDraft}>Save as draft & attach</Button>
                  </div>
                </div>
                <Field label="Instructions">
                  <TextArea rows={2} placeholder="Write assignment instructions..." value={assignInstructions} onChange={(e) => setAssignInstructions(e.target.value)} />
                </Field>
              </div>
            ) : (
              <div>
                <SelectField
                  label="Link Existing Assignment"
                  options={assignments.map((a) => a.title)}
                  value={linkedAssignment}
                  onChange={(e) => setLinkedAssignment(e.target.value)}
                  placeholder="Select an assignment"
                />
                {assignments.length === 0 && <p className="text-xs text-text-muted -mt-1">No assignments for this subject yet.</p>}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border-light pt-5">
            <Button variant="secondary" onClick={() => router.push("/teacher")}>Cancel</Button>
            <Button onClick={handleSave}>{existing ? "Update Lesson Note" : "Save Lesson Note"}</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}