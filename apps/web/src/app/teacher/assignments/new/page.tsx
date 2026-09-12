"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";
import { Plus, Trash2 } from "lucide-react";
import { useSubjectAssignments } from "@/lib/app-store";

type QuestionType = "mcq" | "theory" | "truefalse";

interface Question {
  id: number;
  type: QuestionType;
  text: string;
  options: string[];
  answer?: string;
  correct?: string;
  marks: string;
}

const TYPE_LABEL: Record<QuestionType, string> = {
  mcq: "MCQ",
  theory: "Theory",
  truefalse: "True or False",
};

const TYPE_OPTIONS = ["MCQ", "Theory", "True or False"];

const typeToCode = (label: string): QuestionType => {
  if (label === "MCQ") return "mcq";
  if (label === "Theory") return "theory";
  return "truefalse";
};

let qid = 1;

export default function NewAssignmentPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useSubjectAssignments("Biology");
  const [title, setTitle] = useState("");
  const [cls, setCls] = useState(""); 
  const [due, setDue] = useState("");
  const [instructions, setInstructions] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qType, setQType] = useState<QuestionType>("mcq");

  const addQuestion = () => {
    setQuestions((qs) => [
      ...qs,
      {
        id: qid++,
        type: qType,
        text: "",
        options: qType === "mcq" ? ["", "", "", ""] : [],
        marks: "2",
      },
    ]);
  };

  const updateQuestion = (id: number, patch: Partial<Question>) => {
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  };

  const updateOption = (id: number, idx: number, value: string) => {
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === id ? { ...q, options: q.options.map((o, i) => (i === idx ? value : o)) } : q
      )
    );
  };

  const removeQuestion = (id: number) => {
    setQuestions((qs) => qs.filter((q) => q.id !== id));
  };

  const publish = () => {
    setAssignments([
      ...assignments,
      {
        id: Math.random().toString(36).slice(2, 10),
        subject: "Biology",
        title: title || "Untitled Assignment",
        cls: cls || "SS1 Science",
        due,
        instructions,
        questions: questions.map((q) => ({ type: q.type, text: q.text, marks: q.marks })),
        status: "pending",
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      },
    ]);
    router.push("/teacher/subjects/biology");
  };

  return (
    <div className="max-w-[860px] mx-auto">
      <PageHeader
        title="New Assignment"
        subtitle="Create an assignment with a mix of question types"
        actions={
          <Link href="/teacher/subjects/biology">
            <Button variant="secondary">Cancel</Button>
          </Link>
        }
      />

      <div className="space-y-5">
        <Card className="p-6">
          <div className="grid grid-cols-1 gap-4">
            <Field label="Assignment Title" required>
              <TextInput placeholder="e.g. Genetics Worksheet" value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <SelectField label="Class" required options={["SS1 Science", "SS2 Science", "SS3 Science"]} value={cls} onChange={(e) => setCls(e.target.value)} placeholder="Select class" />
              <Field label="Due Date" required>
                <TextInput type="date" value={due} onChange={(e) => setDue(e.target.value)} />
              </Field>
            </div>
            <Field label="Instructions" required>
              <TextArea rows={3} placeholder="Write assignment instructions..." value={instructions} onChange={(e) => setInstructions(e.target.value)} />
            </Field>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-end justify-between gap-4 mb-4">
            <div className="flex items-end gap-3 flex-1">
              <div className="flex-1">
                <SelectField
                  label="Question Type"
                  value={TYPE_LABEL[qType]}
                  onChange={(e) => setQType(typeToCode(e.target.value))}
                  options={TYPE_OPTIONS}
                  placeholder="Select type"
                />
              </div>
            </div>
            <Button size="sm" onClick={addQuestion}>
              <Plus className="w-4 h-4" /> Add Question
            </Button>
          </div>

          {questions.length === 0 && (
            <div className="rounded-xl border border-dashed border-border-light p-8 text-center">
              <p className="text-sm text-text-muted">No questions yet. Add MCQ, Theory, or True or False questions above.</p>
            </div>
          )}

          <div className="space-y-4">
            {questions.map((q, qi) => (
              <div key={q.id} className="rounded-xl border border-border-light p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary">
                    <span className="w-6 h-6 rounded-md bg-primary-light text-primary flex items-center justify-center">{qi + 1}</span>
                    {TYPE_LABEL[q.type]}
                  </span>
                  <button
                    onClick={() => removeQuestion(q.id)}
                    className="w-8 h-8 rounded-lg text-red hover:bg-red-light/50 flex items-center justify-center"
                    aria-label="Remove question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <Field label="Question">
                  <TextInput placeholder="Enter the question" value={q.text} onChange={(e) => updateQuestion(q.id, { text: e.target.value })} />
                </Field>

                {q.type === "mcq" && (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <span className="w-6 text-xs font-bold text-text-muted uppercase">{String.fromCharCode(65 + oi)}</span>
                        <TextInput
                          value={opt}
                          placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                          onChange={(e) => updateOption(q.id, oi, e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {q.type === "truefalse" && (
                  <div className="mt-3">
                    <SelectField
                      label="Correct Answer"
                      options={["True", "False"]}
                      value={q.correct || ""}
                      onChange={(e) => updateQuestion(q.id, { correct: e.target.value })}
                      placeholder="Select correct answer"
                    />
                  </div>
                )}

                {q.type === "theory" && (
                  <Field label="Suggested Marking Points">
                    <TextArea rows={2} placeholder="Optional – marking points for grading" value={q.answer || ""} onChange={(e) => updateQuestion(q.id, { answer: e.target.value })} />
                  </Field>
                )}

                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-text-muted">Marks</span>
                  <TextInput value={q.marks} onChange={(e) => updateQuestion(q.id, { marks: e.target.value })} className="w-20" />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border-light pt-5 mt-5">
            <Button variant="secondary" onClick={() => router.push("/teacher/subjects/biology")}>Cancel</Button>
            <Button onClick={publish}>Publish Assignment</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
