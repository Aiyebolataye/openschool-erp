"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";

type TemplateStatus = "Approved" | "Pending" | "Draft";

type Template = {
  id: number;
  name: string;
  subject: string;
  body: string;
  status: TemplateStatus;
};

const channels = ["Email", "SMS", "WhatsApp", "Announcements"];

const statusVariant: Record<TemplateStatus, "green" | "orange" | "muted"> = {
  Approved: "green",
  Pending: "orange",
  Draft: "muted",
};

const emailTemplates: Template[] = [
  { id: 1, name: "Term Report Notification", subject: "Your child's term report is ready", body: "Dear Parent, the term report for {student_name} is now available on the school portal. Please log in to review it. Kind regards, Administration.", status: "Approved" },
  { id: 2, name: "Admission Offer", subject: "Admission offer — {student_name}", body: "Congratulations! {student_name} has been offered admission into {class}. Please complete the acceptance process by {deadline}. Regards, Admissions Office.", status: "Approved" },
  { id: 3, name: "Fee Payment Reminder", subject: "Fee payment due reminder", body: "Dear Parent, kindly note that tuition fees for {term} are due by {due_date}. Please make payment to avoid disruption of classes. Thank you.", status: "Approved" },
  { id: 4, name: "Parent-Teacher Conference Invite", subject: "Parent-Teacher Conference {date}", body: "You are invited to the Parent-Teacher Conference on {date} at {time}. Please book a slot with your child's teachers via the portal. Best regards.", status: "Approved" },
  { id: 5, name: "School Newsletter — Term 3", subject: "Newsletter: Term 3 highlights", body: "Catch up on all the latest news, achievements, and upcoming events in our Term 3 newsletter. Read it on the portal now. Warm regards, Communications.", status: "Pending" },
  { id: 6, name: "Exam Timetable Update", subject: "Updated exam timetable", body: "Please note the revised exam timetable for {term}. The updated schedule is available on the portal. Exams begin {start_date}. Regards, Academics.", status: "Pending" },
  { id: 7, name: "Result Release Notice", subject: "Results now available", body: "Dear Parent, your child's results are now available on the school portal. Please log in to view and download them. Thank you, Administration.", status: "Approved" },
  { id: 8, name: "Open Day Invitation", subject: "Annual Open Day — {date}", body: "You are cordially invited to our Annual Open Day on {date}. Tours, exhibitions, and refreshments await. Please RSVP via the portal. See you there!", status: "Draft" },
  { id: 9, name: "Graduation Ceremony Invite", subject: "Graduation ceremony invitation", body: "We celebrate the graduation of {student_name} on {date} at {venue}. Join us for this memorable occasion. Regards, Graduation Committee.", status: "Approved" },
  { id: 10, name: "Field Trip Permission", subject: "Field trip consent — {trip}", body: "Dear Parent, the school is organizing a field trip to {location} on {date}. Please complete the consent form on the portal by {deadline}. Regards.", status: "Pending" },
  { id: 11, name: "Library Late Return Notice", subject: "Overdue library book", body: "Our records show that {book_title} borrowed by {student_name} is overdue. Please return it to the library at your earliest convenience. Thank you.", status: "Draft" },
  { id: 12, name: "Uniform Change Advisory", subject: "New uniform policy update", body: "Please note that the new uniform policy takes effect from {date}. Details of the changes are available on the portal. Regards, Administration.", status: "Approved" },
];

const smsTemplates: Template[] = [
  { id: 1, name: "Urgent Class Cancellation", subject: "Class cancelled", body: "Dear Parent, {class} has been cancelled today due to {reason}. Students will be dismissed at {time}. Regards.", status: "Approved" },
  { id: 2, name: "Bus Route Update", subject: "Bus route change", body: "Dear Parent, bus route {route} has been updated. New pickup time is {time}. Check the portal for details. Thank you.", status: "Approved" },
  { id: 3, name: "Fee Due Reminder", subject: "Fee reminder", body: "Dear Parent, fees for {term} are due {due_date}. Please pay on time to avoid disruption. Thank you.", status: "Approved" },
  { id: 4, name: "Sports Day Reminder", subject: "Sports Day", body: "Sports Day is {date} at {venue}. Students should come in sports wear and arrive by {time}. See you there!", status: "Pending" },
  { id: 5, name: "Weather Closure Alert", subject: "School closure", body: "Due to {weather}, school is closed today. Lessons resume {date}. Stay safe. Regards, Administration.", status: "Approved" },
  { id: 6, name: "PTA Meeting Notice", subject: "PTA meeting", body: "PTA meeting holds {date} at {time} in the school hall. Your attendance is kindly requested. Regards, PTA.", status: "Pending" },
  { id: 7, name: "Exam Registration Reminder", subject: "Exam registration", body: "Kindly complete exam registration for {student_name} by {deadline}. Visit the portal to proceed. Thank you.", status: "Draft" },
  { id: 8, name: "Report Card Ready Alert", subject: "Report card ready", body: "Dear Parent, {student_name}'s report card is ready for pickup from {date}. Please collect it at the school office. Regards.", status: "Approved" },
];

const whatsappTemplates: Template[] = [
  { id: 1, name: "Weekly Parent Update", subject: "Weekly update", body: "Here's a summary of your child's week: {summary}. Questions? Reply to this chat. Best regards, {teacher_name}.", status: "Approved" },
  { id: 2, name: "Homework Reminder", subject: "Homework reminder", body: "Reminder: homework for {subject} is due {date}. Please help {student_name} complete it. Thank you, {teacher_name}.", status: "Approved" },
  { id: 3, name: "Teacher Availability Notice", subject: "Teacher availability", body: "Hi Parents, I will be available for consultations on {date} from {time}. Book a slot via the portal. Regards, {teacher_name}.", status: "Pending" },
  { id: 4, name: "Event RSVP Request", subject: "Event RSVP", body: "Kindly confirm your attendance for {event} on {date}. Reply YES to this chat or RSVP on the portal. Thank you!", status: "Approved" },
  { id: 5, name: "Cafeteria Menu of the Week", subject: "Menu this week", body: "Here is the cafeteria menu for the week: {menu}. Prepay via the portal to enjoy daily meals. Bon appetit!", status: "Draft" },
  { id: 6, name: "School Trip Photo Share", subject: "Trip photos", body: "Photos from the {trip} trip are now available on the portal. Download and share the memories! Regards, Communications.", status: "Pending" },
];

const initialTemplates: Record<string, Template[]> = {
  Email: emailTemplates,
  SMS: smsTemplates,
  WhatsApp: whatsappTemplates,
  Announcements: [],
};

export default function TemplatesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <TemplatesContent />
    </Suspense>
  );
}

function TemplatesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawChannel = searchParams.get("channel");
  const defaultChannel = rawChannel && channels.includes(rawChannel) ? rawChannel : "Email";

  const [tab, setTab] = useState(defaultChannel);
  const [templates, setTemplates] = useState(initialTemplates);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<TemplateStatus>("Draft");
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  function switchTab(next: string) {
    setTab(next);
    router.replace(`/institution/communication/templates?channel=${next}`);
  }

  function openNew() {
    setEditIndex(null);
    setName("");
    setSubject("");
    setBody("");
    setStatus("Draft");
    setModalOpen(true);
  }

  function openEdit(i: number) {
    const t = templates[tab][i];
    setEditIndex(i);
    setName(t.name);
    setSubject(t.subject);
    setBody(t.body);
    setStatus(t.status);
    setModalOpen(true);
  }

  function handleSave() {
    setTemplates((prev) => {
      const list = [...prev[tab]];
      const template: Template = {
        id: editIndex !== null ? list[editIndex].id : Date.now(),
        name,
        subject,
        body,
        status,
      };
      if (editIndex !== null) {
        list[editIndex] = template;
      } else {
        list.push(template);
      }
      return { ...prev, [tab]: list };
    });
    setModalOpen(false);
    setToast("Template saved");
  }

  return (
    <div className="max-w-[1000px] mx-auto">
      <PageHeader
        title="Message Templates"
        subtitle="Edit and manage communication templates"
        actions={
          <Link href="/institution/communication">
            <Button variant="secondary">← Back to Communication</Button>
          </Link>
        }
      />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex items-center gap-2 mb-6">
        {channels.map((c) => (
          <button
            key={c}
            onClick={() => switchTab(c)}
            className={`px-4 h-9 rounded-lg text-sm font-medium transition-colors ${
              tab === c ? "bg-primary text-white" : "bg-card border border-border-light text-text-muted hover:text-text-dark hover:bg-surface"
            }`}
          >
            {c}
          </button>
        ))}
        <Button className="ml-auto" onClick={openNew}>+ New Template</Button>
      </div>

      <Card className="divide-y divide-border-light">
        {templates[tab].length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-text-muted">No templates yet for {tab}.</p>
            <p className="text-xs text-text-muted mt-1">Use “+ New Template” to create one.</p>
          </div>
        ) : (
          templates[tab].map((t, i) => (
            <div
              key={t.id}
              className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-surface-secondary transition-colors"
              onClick={() => openEdit(i)}
            >
              <div className="min-w-0 pr-4">
                <p className="text-sm font-medium text-text-dark">{t.name}</p>
                <p className="text-xs text-text-muted mt-0.5 truncate">{t.subject}</p>
                <p className="text-xs text-text-muted mt-1 truncate">
                  {t.body.length > 80 ? `${t.body.slice(0, 80)}…` : t.body}
                </p>
              </div>
              <Badge variant={statusVariant[t.status]}>{t.status}</Badge>
            </div>
          ))
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editIndex !== null ? "Edit Template" : "New Template"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Template</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Name" required>
            <TextInput placeholder="Template name" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Subject" required>
            <TextInput placeholder="Enter subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </Field>
          <Field label="Body" required>
            <TextArea rows={5} placeholder="Type your message..." value={body} onChange={(e) => setBody(e.target.value)} />
          </Field>
          <SelectField
            label="Status"
            options={["Approved", "Pending", "Draft"]}
            value={status}
            onChange={(e) => setStatus(e.target.value as TemplateStatus)}
          />
        </div>
      </Modal>
    </div>
  );
}