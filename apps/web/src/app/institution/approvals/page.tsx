"use client";

import { useState } from "react";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { TextArea } from "@/components/ui/form";
import { SearchInput } from "@/components/ui/search-input";

const kpis = [
  { label: "Pending Approvals", value: "18", detail: "", detailColor: "orange" as const },
  { label: "Approved Today", value: "22", detail: "", detailColor: "green" as const },
  { label: "Rejected Today", value: "3", detail: "", detailColor: "red" as const },
  { label: "Delegated", value: "5", detail: "", detailColor: "muted" as const },
];

const rawItems = [
  { name: "Admission — Chidi Eze", type: "Admission", submittedBy: "Admissions Office", submitted: "2h ago", priority: "NORMAL", priorityVariant: "muted" as const },
  { name: "Fee waiver — Grace Lim", type: "Fee Waiver", submittedBy: "Finance", submitted: "4h ago", priority: "URGENT", priorityVariant: "red" as const },
  { name: "Results — SS2 Term 2", type: "Results", submittedBy: "Mr. Obi", submitted: "1d ago", priority: "NORMAL", priorityVariant: "muted" as const },
  { name: "Attendance correction — SS1", type: "Attendance", submittedBy: "Mrs. Ajayi", submitted: "1d ago", priority: "NORMAL", priorityVariant: "muted" as const },
];

const columns = [
  { key: "item", label: "ITEM", width: "200px" },
  { key: "type", label: "TYPE", width: "110px" },
  { key: "submittedBy", label: "SUBMITTED BY", width: "140px" },
  { key: "submitted", label: "SUBMITTED", width: "100px" },
  { key: "priority", label: "PRIORITY", width: "90px" },
  { key: "actions", label: "ACTIONS", width: "80px", align: "right" as const },
];

export default function ApprovalsPage() {
  const [selectedItem, setSelectedItem] = useState<typeof rawItems[number] | null>(null);
  const [comments, setComments] = useState("");
  const [search, setSearch] = useState("");

  const openModal = (item: typeof rawItems[number]) => {
    setSelectedItem(item);
    setComments("");
  };

  const closeModal = () => {
    setSelectedItem(null);
    setComments("");
  };

  const q = search.trim().toLowerCase();
  const visibleItems = q
    ? rawItems.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.type.toLowerCase().includes(q)
      )
    : rawItems;

  const data = visibleItems.map((item) => ({
    item: { text: item.name, variant: "muted" as const },
    type: item.type,
    submittedBy: item.submittedBy,
    submitted: item.submitted,
    priority: { text: item.priority, variant: item.priorityVariant },
    actions: (
      <Button variant="secondary" size="sm" onClick={() => openModal(item)}>
        Review
      </Button>
    ),
  }));

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Approval Center"
        subtitle="Review or delegate approvals across all workflows"
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <Card className="p-4 mb-6">
        <SearchInput placeholder="Search by name or type..." className="w-full" value={search} onChange={setSearch} />
      </Card>

      <DataTable columns={columns} data={data} />

      {selectedItem && (
        <Modal
          open
          onClose={closeModal}
          title={selectedItem.name}
          subtitle={selectedItem.type}
          footer={
            <>
              <Button variant="danger" size="sm" onClick={closeModal}>
                Reject
              </Button>
              <Button variant="primary" size="sm" onClick={closeModal}>
                Approve
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-text-muted text-xs">Type</span>
                <p className="text-text-dark font-medium">{selectedItem.type}</p>
              </div>
              <div>
                <span className="text-text-muted text-xs">Submitted by</span>
                <p className="text-text-dark font-medium">{selectedItem.submittedBy}</p>
              </div>
              <div>
                <span className="text-text-muted text-xs">Submitted</span>
                <p className="text-text-dark font-medium">{selectedItem.submitted}</p>
              </div>
              <div>
                <span className="text-text-muted text-xs">Priority</span>
                <div className="mt-0.5">
                  <Badge variant={selectedItem.priorityVariant}>{selectedItem.priority}</Badge>
                </div>
              </div>
            </div>
            <TextArea
              placeholder="Review Comments"
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
