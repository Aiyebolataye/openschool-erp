"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";
import { Save } from "lucide-react";

const categories = ["African Fiction", "Literature", "Science", "History", "Biography", "Poetry", "Reference"];

interface AddedBook {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  copies: number;
  shelf: string;
}

export default function LibrarianAddBookPage() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [category, setCategory] = useState("");
  const [copies, setCopies] = useState("");
  const [shelf, setShelf] = useState("");
  const [description, setDescription] = useState("");

  const [recent, setRecent] = useState<AddedBook[]>([
    { id: "BK-011", title: "Stay With Me", author: "Ayọ̀bámi Adébáyọ̀", isbn: "978-1-5011-4590-1", category: "Literature", copies: 4, shelf: "B-4" },
    { id: "BK-010", title: "General Science for Schools", author: "Dr. Nnamdi Okafor", isbn: "978-978-031-230-1", category: "Science", copies: 8, shelf: "C-1" },
  ]);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const saveBook = () => {
    if (!title.trim() || !author.trim() || !isbn.trim() || !category || !copies) return;
    const maxId = Math.max(...recent.map((b) => parseInt(b.id.slice(3), 10)), 10);
    const newBook: AddedBook = {
      id: `BK-${maxId + 1}`,
      title: title.trim(),
      author: author.trim(),
      isbn: isbn.trim(),
      category,
      copies: parseInt(copies, 10) || 1,
      shelf: shelf.trim() || "Z-1",
    };
    setRecent((prev) => [newBook, ...prev]);
    setTitle("");
    setAuthor("");
    setIsbn("");
    setCategory("");
    setCopies("");
    setShelf("");
    setDescription("");
    showToast(`${newBook.title} added to the catalogue`);
  };

  return (
    <div className="max-w-[800px] mx-auto">
      <PageHeader
        title="Add Book"
        subtitle="Add a new book to the library catalogue"
      />

      <Card className="p-6 mb-6">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Title" required>
              <TextInput placeholder="Book title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>
            <Field label="Author" required>
              <TextInput placeholder="Author name" value={author} onChange={(e) => setAuthor(e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="ISBN" required>
              <TextInput placeholder="978-0-00-000000-0" value={isbn} onChange={(e) => setIsbn(e.target.value)} />
            </Field>
            <SelectField
              label="Category"
              required
              placeholder="Select category"
              options={categories}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <Field label="Copies" required>
              <TextInput type="number" placeholder="1" value={copies} onChange={(e) => setCopies(e.target.value)} />
            </Field>
          </div>
          <Field label="Shelf">
            <TextInput placeholder="e.g. A-3" value={shelf} onChange={(e) => setShelf(e.target.value)} />
          </Field>
          <Field label="Description">
            <TextArea rows={4} placeholder="Short description of the book..." value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <div>
            <Button onClick={saveBook}>
              <Save className="w-4 h-4" /> Save Book
            </Button>
          </div>
        </div>
      </Card>

      <div>
        <h3 className="text-sm font-semibold text-text-dark mb-2">Recently Added</h3>
        <Card className="divide-y divide-border-light">
          {recent.map((b) => (
            <div key={b.id} className="flex items-center justify-between px-5 py-3.5">
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-dark truncate">{b.title}</p>
                <p className="text-xs text-text-muted mt-0.5">
                  {b.author} · {b.isbn} · Shelf {b.shelf}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="blue">{b.category}</Badge>
                <span className="text-xs text-text-muted">{b.copies} copies</span>
              </div>
            </div>
          ))}
          {recent.length === 0 && (
            <p className="text-sm text-text-muted px-5 py-4">No books added yet.</p>
          )}
        </Card>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-green text-white px-5 py-3 rounded-lg shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}
    </div>
  );
}
