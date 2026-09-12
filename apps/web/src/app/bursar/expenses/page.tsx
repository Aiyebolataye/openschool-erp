"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, SelectField } from "@/components/ui/form";
import type { TableRow } from "@/types";
import { Plus } from "lucide-react";

type ExpenseStatus = "Approved" | "Pending" | "Rejected";

interface Expense {
  id: string;
  item: string;
  category: string;
  amount: number;
  account: string;
  date: string;
  status: ExpenseStatus;
}

const statusBadge = (s: ExpenseStatus) =>
  s === "Approved"
    ? { text: "Approved", variant: "green" as const }
    : s === "Pending"
      ? { text: "Pending", variant: "orange" as const }
      : { text: "Rejected", variant: "red" as const };

const naira = (n: number) => `₦${n.toLocaleString()}`;

const initialExpenses: Expense[] = [
  { id: "EXP-3051", item: "Staff salaries — September", category: "Salaries", amount: 4250000, account: "Bank Account", date: "02 Sep 2026", status: "Approved" },
  { id: "EXP-3050", item: "Generator diesel refill", category: "Utilities", amount: 180000, account: "Petty Cash", date: "05 Sep 2026", status: "Approved" },
  { id: "EXP-3049", item: "Science lab equipment", category: "Maintenance", amount: 350000, account: "Bank Account", date: "04 Sep 2026", status: "Pending" },
  { id: "EXP-3048", item: "Exercise books & stationery", category: "Stationery", amount: 96000, account: "Petty Cash", date: "03 Sep 2026", status: "Approved" },
  { id: "EXP-3047", item: "School bus fuel", category: "Transport", amount: 210000, account: "Bank Account", date: "06 Sep 2026", status: "Pending" },
  { id: "EXP-3046", item: "Inter-house sports t-shirts", category: "Ad-hoc", amount: 240000, account: "Petty Cash", date: "30 Aug 2026", status: "Rejected" },
];

const columns = [
  { key: "item", label: "ITEM" },
  { key: "category", label: "CATEGORY" },
  { key: "amount", label: "AMOUNT", align: "right" as const },
  { key: "account", label: "ACCOUNT" },
  { key: "date", label: "DATE" },
  { key: "status", label: "STATUS" },
];

const categoryOptions = ["Utilities", "Salaries", "Maintenance", "Stationery", "Transport", "Ad-hoc"];

export default function BursarExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [addOpen, setAddOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Expense | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [expItem, setExpItem] = useState("");
  const [expCategory, setExpCategory] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expAccount, setExpAccount] = useState("");
  const [expDate, setExpDate] = useState("");
  const [expStatus, setExpStatus] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const rows: TableRow[] = expenses.map((e) => ({
    item: (
      <div>
        <p className="text-sm font-medium text-text-dark">{e.item}</p>
        <p className="text-xs text-text-muted">{e.id}</p>
      </div>
    ),
    category: e.category,
    amount: naira(e.amount),
    account: e.account,
    date: e.date,
    status: statusBadge(e.status),
  }));

  const openDetail = (row: TableRow, i: number) => {
    setSelected(expenses[i]);
    setDetailOpen(true);
  };

  const saveAdd = () => {
    if (!expItem || !expCategory || !expAmount || !expAccount || !expDate || !expStatus) return;
    setExpenses((prev) => [
      ...prev,
      {
        id: `EXP-${Math.max(...prev.map((e) => parseInt(e.id.slice(4), 10))) + 1}`,
        item: expItem,
        category: expCategory,
        amount: parseInt(expAmount, 10) || 0,
        account: expAccount,
        date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        status: expStatus as ExpenseStatus,
      },
    ]);
    setAddOpen(false);
    setExpItem("");
    setExpCategory("");
    setExpAmount("");
    setExpAccount("");
    setExpDate("");
    setExpStatus("");
    showToast("Expense added");
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Expenses"
        subtitle="School expenditure and running costs"
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4" /> Add Expense
          </Button>
        }
      />

      <DataTable columns={columns} data={rows} onRowClick={openDetail} />

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Expense"
        subtitle="Log a new school expense"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={saveAdd}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Item" required>
            <TextInput
              placeholder="e.g. Generator diesel refill"
              value={expItem}
              onChange={(e) => setExpItem(e.target.value)}
            />
          </Field>
          <SelectField
            label="Category"
            required
            placeholder="Select category"
            options={categoryOptions}
            value={expCategory}
            onChange={(e) => setExpCategory(e.target.value)}
          />
          <Field label="Amount" required>
            <TextInput
              placeholder="₦0.00"
              value={expAmount}
              onChange={(e) => setExpAmount(e.target.value)}
            />
          </Field>
          <SelectField
            label="Account"
            required
            placeholder="Select account"
            options={["Bank Account", "Petty Cash"]}
            value={expAccount}
            onChange={(e) => setExpAccount(e.target.value)}
          />
          <Field label="Date" required>
            <TextInput type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)} />
          </Field>
          <SelectField
            label="Status"
            required
            placeholder="Select status"
            options={["Approved", "Pending", "Rejected"]}
            value={expStatus}
            onChange={(e) => setExpStatus(e.target.value)}
          />
        </div>
      </Modal>

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={selected?.item ?? ""}
        subtitle={selected?.id}
        footer={
          <Button variant="secondary" onClick={() => setDetailOpen(false)}>Close</Button>
        }
      >
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-border-light p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-text-muted">Amount</p>
                <p className="text-lg font-bold text-text-dark">{naira(selected.amount)}</p>
              </div>
              <Badge variant={statusBadge(selected.status).variant}>{selected.status}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-surface p-4">
                <p className="text-xs text-text-muted">Category</p>
                <p className="text-sm font-semibold text-text-dark mt-1">{selected.category}</p>
              </div>
              <div className="rounded-lg bg-surface p-4">
                <p className="text-xs text-text-muted">Account</p>
                <p className="text-sm font-semibold text-text-dark mt-1">{selected.account}</p>
              </div>
              <div className="rounded-lg bg-surface p-4">
                <p className="text-xs text-text-muted">Date</p>
                <p className="text-sm font-semibold text-text-dark mt-1">{selected.date}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-green text-white px-5 py-3 rounded-lg shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}
    </div>
  );
}