"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { Field, TextArea } from "@/components/ui/form";

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
  {
    id: "lc-1",
    title: "SS1 Biology — Lesson 12: Cell Structure",
    teacher: "Mrs. Ajayi",
    subject: "Biology",
    cls: "SS1 Science",
    date: "Jul 28",
    status: { text: "Review", variant: "orange" as const },
    fullNote: `CELL STRUCTURE AND ORGANELLES\n\nLearning Objectives:\nBy the end of this lesson, students should be able to:\n1. Identify and describe the main organelles of eukaryotic cells\n2. Compare plant and animal cell structures\n3. Explain the function of each organelle\n\nIntroduction (10 min):\nBegin with a discussion of what students already know about cells. Show diagrams of plant and animal cells.\n\nMain Content:\n\n1. Cell Membrane\n- Semi-permeable phospholipid bilayer\n- Controls movement of substances in and out of the cell\n- Contains integral and peripheral proteins\n- Selectively permeable\n\n2. Nucleus\n- Contains genetic material (DNA)\n- Controls cell activities and reproduction\n- Nuclear membrane with pores\n- Contains nucleolus for ribosome assembly\n\n3. Mitochondria\n- Site of cellular respiration\n- Produces ATP (energy currency)\n- Has double membrane\n- Contains its own DNA\n\n4. Ribosomes\n- Site of protein synthesis\n- Can be free-floating or attached to ER\n- Made of rRNA and proteins\n- Found in all cells\n\n5. Endoplasmic Reticulum (ER)\n- Rough ER: has ribosomes, processes proteins\n- Smooth ER: no ribosomes, synthesises lipids\n- Connected to nuclear membrane\n\n6. Golgi Apparatus\n- Modifies, packages, and sorts proteins\n- Produces lysosomes\n- Has cis and trans faces\n\n7. Lysosomes\n- Contain digestive enzymes\n- Break down waste and foreign material\n- Formed by Golgi apparatus\n\nPractical Activity:\nStudents will examine prepared slides of onion epidermis and cheek cells under the microscope. They will draw and label the organelles they observe.\n\nWorksheet Questions:\n1. Distinguish between plant and animal cells\n2. Explain the function of mitochondria\n3. Why is the cell membrane described as selectively permeable?\n4. What is the role of ribosomes in protein synthesis?\n\nAssessment:\nExit ticket: List 4 organelles and their functions`,
  },
  {
    id: "lc-2",
    title: "JSS2 Math — Algebra Intro",
    teacher: "Mr. Obi",
    subject: "Mathematics",
    cls: "JSS2 B",
    date: "Jul 29",
    status: { text: "Review", variant: "orange" as const },
    fullNote: `INTRODUCTION TO ALGEBRAIC EXPRESSIONS\n\nLearning Objectives:\n1. Understand what variables and constants represent\n2. Write algebraic expressions from word problems\n3. Simplify basic algebraic expressions\n4. Substitute values into expressions\n\nIntroduction:\nReview arithmetic operations. Explain that in algebra, we use letters to represent unknown numbers.\n\nMain Content:\n\n1. Variables and Constants\n- A variable is a letter that represents an unknown value (e.g., x, y, z)\n- A constant is a fixed value (e.g., 5, -3, 0.5)\n\n2. Writing Expressions\n- "5 more than x" → x + 5\n- "3 times a number decreased by 2" → 3x - 2\n- "The sum of two numbers" → a + b\n\n3. Simplifying Express\n- Combine like terms: 3x + 2x = 5x\n- Remove brackets: 2(x + 3) = 2x + 6\n\n4. Substitution\n- If x = 4, evaluate 2x + 3\n- 2(4) + 3 = 11\n\nExercises:\n[Various practice problems]\n\nHomework:\nWorksheet on algebraic expressions`,
  },
  {
    id: "lc-3",
    title: "SS2 English — Poetry Analysis",
    teacher: "Ms. Tran",
    subject: "English",
    cls: "SS2 Art",
    date: "Jul 30",
    status: { text: "Review", variant: "orange" as const },
    fullNote: `CLOSE READING OF WEST AFRICAN POEMS\n\nLearning Objectives:\n1. Analyse imagery and figurative language in poetry\n2. Identify tone and mood in selected poems\n3. Interpret themes of identity, belonging, and nature\n4. Write a structured poetry analysis paragraph\n\nPoems for Study:\n1. "The Song of the Woman from Djenne" — Lenri Pearson\n2. "Africa" — David Diop\n3. "A Dead Poem" — Niyi Osundare\n\nLesson Plan:\n\nWarm-up (10 min):\nDiscuss: What makes a poem powerful? What do you notice first?\n\nPoem 1 Analysis (20 min):\nRead aloud. Focus on imagery — what scenes does the poet create? How does the repetition of "I am" build a sense of identity?\n\nPoem 2 Analysis (20 min):\nExamine the personification of Africa. How does Diop portray the continent? What emotions does the poem evoke?\n\nPoem 3 Discussion (15 min):\nWhat makes this a "dead" poem? How does Osundare comment on loss and preservation?\n\nWriting Task:\nWrite a 200-word analysis of one of the poems, focusing on how the poet uses imagery to develop a theme.\n\nAssessment:\nPeer review of analysis paragraphs; complete the poetry journal entry`,
  },
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
            <Button variant="ghost" size="sm">{c.manage || "Manage"}</Button>
          </div>
        </div>
      ))}
    </Card>
  );
}

function ContentList({ onReview }: { onReview: (id: string) => void }) {
  return (
    <Card className="divide-y divide-border-light">
      {pendingContent.map((p) => (
        <div key={p.id} className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-medium text-text-dark">{p.title}</p>
            <p className="text-xs text-text-muted mt-0.5">{p.teacher} · {p.cls} · Posted {p.date}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={p.status.variant as "orange"}>{p.status.text}</Badge>
            <Button variant="secondary" size="sm" onClick={() => onReview(p.id)}>Review</Button>
          </div>
        </div>
      ))}
    </Card>
  );
}

function FullReview({ note, onBack }: { note: typeof pendingContent[number]; onBack: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="secondary" size="sm" onClick={onBack}>← Back to Content</Button>
      </div>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div><span className="text-xs text-text-muted block">Teacher</span><span className="text-text-dark font-medium">{note.teacher}</span></div>
        <div><span className="text-xs text-text-muted block">Subject / Class</span><span className="text-text-dark font-medium">{note.subject} · {note.cls}</span></div>
        <div><span className="text-xs text-text-muted block">Date Posted</span><span className="text-text-dark font-medium">{note.date}</span></div>
      </div>
      <Card className="p-6">
        <div className="whitespace-pre-wrap text-sm text-text-dark leading-relaxed font-mono">{note.fullNote}</div>
      </Card>
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-text-dark mb-3">Review Notes</h3>
        <Field label="Comments for the teacher">
          <TextArea rows={4} placeholder="Add your review comments..." />
        </Field>
        <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-border-light">
          <Button variant="danger" onClick={onBack}>Reject</Button>
          <Button onClick={onBack}>Approve</Button>
        </div>
      </Card>
    </div>
  );
}

export default function PrincipalAcademicsPage() {
  const [reviewId, setReviewId] = useState<string | null>(null);
  const reviewed = pendingContent.find((p) => p.id === reviewId);

  return (
    <div className="max-w-[1000px] mx-auto">
      <PageHeader
        title="Academics & Content"
        subtitle="Configure academic structure and review teacher-submitted content"
      />

      {reviewed ? (
        <FullReview note={reviewed} onBack={() => setReviewId(null)} />
      ) : (
        <Tabs
          tabs={[
            { id: "config", label: "Academic Configuration", content: <ConfigList /> },
            { id: "content", label: "Learning Content", content: <ContentList onReview={(id) => setReviewId(id)} /> },
          ]}
        />
      )}
    </div>
  );
}
