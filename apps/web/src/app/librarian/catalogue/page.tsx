"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { Modal } from "@/components/ui/modal";
import { SelectField } from "@/components/ui/form";
import type { TableRow } from "@/types";
import { BookOpen } from "lucide-react";

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  copies: number;
  available: number;
  description: string;
  shelf: string;
}

const categories = ["African Fiction", "Literature", "Science", "History", "Biography", "Poetry", "Reference"];

const initialBooks: Book[] = [
  { id: "BK-001", title: "Things Fall Apart", author: "Chinua Achebe", isbn: "978-0-435-90525-5", category: "African Fiction", copies: 6, available: 4, description: "A classic novel about pre-colonial Igbo life and the impact of British colonialism on Okonkwo's world.", shelf: "A-1" },
  { id: "BK-002", title: "Purple Hibiscus", author: "Chimamanda Ngozi Adichie", isbn: "978-1-4000-7694-3", category: "African Fiction", copies: 5, available: 3, description: "The story of a young Nigerian girl navigating family, faith and freedom under a tyrannical father.", shelf: "A-2" },
  { id: "BK-003", title: "Half of a Yellow Sun", author: "Chimamanda Ngozi Adichie", isbn: "978-0-00-720028-3", category: "Literature", copies: 4, available: 1, description: "A sweeping novel set during the Biafran War, following the lives of five people entangled in the conflict.", shelf: "A-3" },
  { id: "BK-004", title: "The Concubine", author: "Elechi Amadi", isbn: "978-0-435-90021-2", category: "African Fiction", copies: 3, available: 2, description: "A tale of love, superstition and tragedy in a rural Ikwere village.", shelf: "A-4" },
  { id: "BK-005", title: "Americanah", author: "Chimamanda Ngozi Adichie", isbn: "978-0-307-96112-9", category: "Literature", copies: 4, available: 4, description: "A powerful story of race, identity and love spanning Nigeria, Britain and America.", shelf: "A-5" },
  { id: "BK-006", title: "Ake: The Years of Childhood", author: "Wole Soyinka", isbn: "978-0-09-942283-9", category: "Biography", copies: 3, available: 2, description: "Nobel laureate Wole Soyinka's warm memoir of growing up in the town of Ake in western Nigeria.", shelf: "B-1" },
  { id: "BK-007", title: "The Fishermen", author: "Chigozie Obioma", isbn: "978-0-316-33837-0", category: "Literature", copies: 5, available: 4, description: "A novel about four brothers whose lives are changed by a prophecy of doom beside a river.", shelf: "B-2" },
  { id: "BK-008", title: "Nervous Conditions", author: "Tsitsi Dangarembga", isbn: "978-0-9554700-2-4", category: "African Fiction", copies: 3, available: 3, description: "The coming-of-age story of a young girl in colonial Rhodesia and her struggle for education.", shelf: "B-3" },
  { id: "BK-009", title: "Stay With Me", author: "Ayọ̀bámi Adébáyọ̀", isbn: "978-1-5011-4590-1", category: "Literature", copies: 4, available: 2, description: "A gripping novel about marriage, family and the pressures of childbearing in Nigeria.", shelf: "B-4" },
  { id: "BK-010", title: "General Science for Schools", author: "Dr. Nnamdi Okafor", isbn: "978-978-031-230-1", category: "Science", copies: 8, available: 8, description: "A comprehensive introductory science textbook for secondary school students.", shelf: "C-1" },
];

const statusBadge = (available: number, copies: number) =>
  available > 0
    ? { text: "In", variant: "green" as const }
    : { text: "Out", variant: "red" as const };

const columns = [
  { key: "title", label: "TITLE" },
  { key: "author", label: "AUTHOR" },
  { key: "isbn", label: "ISBN" },
  { key: "category", label: "CATEGORY" },
  { key: "copies", label: "COPIES" },
  { key: "available", label: "AVAILABLE" },
  { key: "status", label: "STATUS" },
];

export default function LibrarianCataloguePage() {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Book | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const q = search.trim().toLowerCase();
  const filtered = books.filter(
    (b) =>
      (!q ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.isbn.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q)) &&
      (!category || b.category === category)
  );

  const rows: TableRow[] = filtered.map((b) => ({
    title: (
      <div>
        <p className="text-sm font-medium text-text-dark">{b.title}</p>
        <p className="text-xs text-text-muted">{b.id}</p>
      </div>
    ),
    author: b.author,
    isbn: b.isbn,
    category: <Badge variant="blue">{b.category}</Badge>,
    copies: String(b.copies),
    available: String(b.available),
    status: statusBadge(b.available, b.copies),
  }));

  const openDetail = (row: TableRow, i: number) => {
    setSelected(filtered[i]);
    setDetailOpen(true);
  };

  const issueBook = () => {
    if (!selected) return;
    setBooks((prev) => prev.map((bk) => (bk.id === selected.id ? { ...bk, available: bk.available - 1 } : bk)));
    setSelected({ ...selected, available: selected.available - 1 });
    setDetailOpen(false);
    showToast(`${selected.title} issued — opening loan form`);
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Book Catalogue"
        subtitle={`${books.length} titles across ${categories.length} categories`}
        actions={
          <Link href="/librarian/add-book">
            <Button>
              <BookOpen className="w-4 h-4" /> Add Book
            </Button>
          </Link>
        }
      />

      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchInput
            placeholder="Search by title, author, ISBN or category..."
            value={search}
            onChange={setSearch}
            className="max-w-md"
          />
          <SelectField
            label=""
            placeholder="All categories"
            options={categories}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-56"
          />
        </div>
      </Card>

      <DataTable columns={columns} data={rows} onRowClick={openDetail} />

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={selected?.title ?? ""}
        subtitle={selected ? `${selected.author} · ${selected.isbn}` : undefined}
        footer={
          selected?.available ? (
            <>
              <Button variant="secondary" onClick={() => setDetailOpen(false)}>Close</Button>
              <Button onClick={issueBook}>Issue Book</Button>
            </>
          ) : undefined
        }
      >
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-lg border border-border-light p-4">
              <div>
                <p className="text-xs text-text-muted">Category</p>
                <p className="text-sm font-medium text-text-dark">{selected.category}</p>
              </div>
              <Badge variant="blue">{selected.category}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-surface p-4">
                <p className="text-xs text-text-muted">Copies</p>
                <p className="text-sm font-semibold text-text-dark mt-1">{selected.copies}</p>
              </div>
              <div className="rounded-lg bg-surface p-4">
                <p className="text-xs text-text-muted">Available</p>
                <p className="text-sm font-semibold text-text-dark mt-1">{selected.available}</p>
              </div>
            </div>
            <p className="text-sm text-text-dark leading-relaxed">{selected.description}</p>
            {!selected.available && (
              <div className="rounded-lg bg-red-light/40 border border-red/30 px-3 py-2 text-xs text-text-dark">
                All copies are currently on loan. Reserve it for the next available copy.
              </div>
            )}
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
