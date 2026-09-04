"use client";

import { useState } from "react";
import { KpiCard } from "@/components/ui/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";

const kpis = [
  { label: "MESSAGES SENT", value: "12.4K", detail: "+8% vs last month", detailColor: "green" as const },
  { label: "TEMPLATES", value: "24", detail: "", detailColor: "muted" as const },
  { label: "CAMPAIGNS", value: "6", detail: "2 active", detailColor: "muted" as const },
  { label: "DELIVERY RATE", value: "98.2%", detail: "", detailColor: "green" as const },
];

const data = [
  { campaign: "Welcome Series", type: { text: "Email", variant: "blue" as const }, audience: "All New Users", status: { text: "Active", variant: "green" as const }, sent: "2,340", openRate: "68.2%", created: "Jun 1, 2026" },
  { campaign: "Monthly Newsletter", type: { text: "Email", variant: "blue" as const }, audience: "All Org Admins", status: { text: "Active", variant: "green" as const }, sent: "1,890", openRate: "54.1%", created: "Jul 1, 2026" },
  { campaign: "Trial Expiry Reminder", type: { text: "In-App", variant: "muted" as const }, audience: "Trial Users", status: { text: "Active", variant: "green" as const }, sent: "420", openRate: "82.3%", created: "May 15, 2026" },
  { campaign: "Maintenance Alert", type: { text: "SMS", variant: "orange" as const }, audience: "All Admins", status: { text: "Draft", variant: "muted" as const }, sent: "—", openRate: "—", created: "Jul 25, 2026" },
  { campaign: "Feature Announcement", type: { text: "Email", variant: "blue" as const }, audience: "Enterprise Plan", status: { text: "Completed", variant: "muted" as const }, sent: "890", openRate: "71.5%", created: "Jul 10, 2026" },
];

const campaignDetails = [
  { channel: "Email", audience: "All New Users", subject: "Welcome to the platform!", body: "Thank you for joining our platform. We're excited to have you on board.", status: "Active", sent: "2,340", openRate: "68.2%", created: "Jun 1, 2026" },
  { channel: "Email", audience: "All Org Admins", subject: "Your Monthly Update", body: "Here's what's new this month across the platform.", status: "Active", sent: "1,890", openRate: "54.1%", created: "Jul 1, 2026" },
  { channel: "In-App", audience: "Trial Users", subject: "Your trial is ending soon", body: "Don't miss out — upgrade now to keep access to all features.", status: "Active", sent: "420", openRate: "82.3%", created: "May 15, 2026" },
  { channel: "SMS", audience: "All Admins", subject: "Scheduled Maintenance", body: "We will be performing maintenance on Saturday from 2AM to 6AM.", status: "Draft", sent: "—", openRate: "—", created: "Jul 25, 2026" },
  { channel: "Email", audience: "Enterprise Plan", subject: "New Features Available", body: "We've rolled out new analytics dashboards for enterprise users.", status: "Completed", sent: "890", openRate: "71.5%", created: "Jul 10, 2026" },
];

const columns = [
  { key: "campaign", label: "CAMPAIGN", width: "180px" },
  { key: "type", label: "TYPE", width: "80px" },
  { key: "audience", label: "AUDIENCE", width: "140px" },
  { key: "status", label: "STATUS", width: "100px" },
  { key: "sent", label: "SENT", width: "80px" },
  { key: "openRate", label: "OPEN RATE", width: "90px" },
  { key: "created", label: "CREATED", width: "110px" },
  { key: "actions", label: "ACTIONS", width: "80px", align: "right" as const },
];

const emailRecipientOptions = [
  "All Organization Admins",
  "All Institution Admins",
  "Specific Organization",
  "Specific Institution",
];

const specificOrgOptions = ["Acme Corp", "Globex", "Initech", "Umbrella"];
const specificInstOptions = ["State University", "Tech Institute", "Central College"];

export default function CommunicationPage() {
  const [campaignOpen, setCampaignOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [campaignName, setCampaignName] = useState("");
  const [campaignChannel, setCampaignChannel] = useState("");
  const [campaignAudience, setCampaignAudience] = useState("");
  const [campaignSubject, setCampaignSubject] = useState("");
  const [campaignBody, setCampaignBody] = useState("");

  const [emailTo, setEmailTo] = useState("");
  const [emailSpecific, setEmailSpecific] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  const [selectedRowIdx, setSelectedRowIdx] = useState<number | null>(null);

  const showViewModal = (idx: number) => {
    setSelectedRowIdx(idx);
    setViewOpen(true);
  };

  const handleSendEmail = () => {
    const count = emailTo.startsWith("All") ? 48 : 12;
    setEmailOpen(false);
    setEmailTo("");
    setEmailSpecific("");
    setEmailSubject("");
    setEmailBody("");
    setToast(`Email sent successfully to ${count} admins`);
    setTimeout(() => setToast(null), 4000);
  };

  const handleCreateCampaign = () => {
    setCampaignOpen(false);
    setCampaignName("");
    setCampaignChannel("");
    setCampaignAudience("");
    setCampaignSubject("");
    setCampaignBody("");
  };

  const showSpecificPicker = emailTo === "Specific Organization" || emailTo === "Specific Institution";

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Communication"
        subtitle="Platform Admin / Communication"
        actions={
          <>
            <Button variant="secondary" onClick={() => setEmailOpen(true)}>Compose Email</Button>
            <Button onClick={() => setCampaignOpen(true)}>+ New Campaign</Button>
          </>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((m) => (
          <KpiCard key={m.label} {...m} />
        ))}
      </div>

      <Card className="p-4 mb-6">
        <div className="flex items-center gap-3">
          <Select options={[{ label: "All Types", value: "all" }]} placeholder="All Types" />
          <Select options={[{ label: "All Statuses", value: "all" }]} placeholder="All Statuses" />
          <SearchInput placeholder="Search campaigns..." className="flex-1" />
        </div>
      </Card>

      <DataTable columns={columns} data={data} />
      <Pagination currentPage={1} totalPages={2} />

      <Modal
        open={campaignOpen}
        onClose={() => setCampaignOpen(false)}
        title="New Campaign"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCampaignOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateCampaign}>Create Campaign</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Campaign Name" required>
            <TextInput placeholder="e.g. Welcome Series" value={campaignName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCampaignName(e.target.value)} />
          </Field>
          <SelectField label="Channel" required options={["Email", "SMS", "Push", "In-App"]} placeholder="Select channel" value={campaignChannel} onChange={(e) => setCampaignChannel(e.target.value)} />
          <SelectField label="Audience" required options={["All Users", "Org Admins", "Institution Admins"]} placeholder="Select audience" value={campaignAudience} onChange={(e) => setCampaignAudience(e.target.value)} />
          <Field label="Subject">
            <TextInput placeholder="e.g. Welcome to the platform!" value={campaignSubject} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCampaignSubject(e.target.value)} />
          </Field>
          <Field label="Body" required>
            <TextArea rows={5} placeholder="Write your campaign message..." value={campaignBody} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCampaignBody(e.target.value)} />
          </Field>
        </div>
      </Modal>

      <Modal
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        title="Compose Email"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEmailOpen(false)}>Cancel</Button>
            <Button onClick={handleSendEmail}>Send Email</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField
            label="To"
            required
            options={emailRecipientOptions}
            placeholder="Select recipients"
            value={emailTo}
            onChange={(e) => { setEmailTo(e.target.value); setEmailSpecific(""); }}
          />
          {showSpecificPicker && (
            <SelectField
              label={emailTo === "Specific Organization" ? "Organization" : "Institution"}
              required
              options={emailTo === "Specific Organization" ? specificOrgOptions : specificInstOptions}
              placeholder={`Select ${emailTo === "Specific Organization" ? "organization" : "institution"}`}
              value={emailSpecific}
              onChange={(e) => setEmailSpecific(e.target.value)}
            />
          )}
          <Field label="Subject" required>
            <TextInput placeholder="e.g. Important Update" value={emailSubject} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmailSubject(e.target.value)} />
          </Field>
          <Field label="Body" required>
            <TextArea rows={6} placeholder="Write your email..." value={emailBody} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEmailBody(e.target.value)} />
          </Field>
        </div>
      </Modal>

      <Modal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        title={selectedRowIdx !== null ? data[selectedRowIdx].campaign : "Campaign Details"}
        footer={<Button variant="secondary" onClick={() => setViewOpen(false)}>Close</Button>}
      >
        {selectedRowIdx !== null && (
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Channel</span><span>{campaignDetails[selectedRowIdx].channel}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Audience</span><span>{campaignDetails[selectedRowIdx].audience}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Subject</span><span>{campaignDetails[selectedRowIdx].subject}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant={campaignDetails[selectedRowIdx].status === "Active" ? "green" : "muted"}>{campaignDetails[selectedRowIdx].status}</Badge></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Sent</span><span>{campaignDetails[selectedRowIdx].sent}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Open Rate</span><span>{campaignDetails[selectedRowIdx].openRate}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{campaignDetails[selectedRowIdx].created}</span></div>
            <div className="border-t pt-3 mt-1">
              <span className="text-muted-foreground block mb-1">Message</span>
              <p className="text-sm">{campaignDetails[selectedRowIdx].body}</p>
            </div>
          </div>
        )}
      </Modal>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg text-sm font-medium animate-in fade-in slide-in-from-bottom-4">
          {toast}
        </div>
      )}
    </div>
  );
}
