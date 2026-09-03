"use client";

import { useEffect, useState } from "react";

export interface DiscReport {
  id: string;
  studentName: string;
  studentId: string;
  className: string;
  reason: string;
  details: string;
  reportedBy: string;
  date: string;
  status: "pending" | "approved" | "rejected";
}

export interface DiscCase {
  id: string;
  studentName: string;
  studentId: string;
  className: string;
  reason: string;
  date: string;
  status: "open" | "resolved";
  resolvedBy?: string;
}

export interface SubjectNote {
  id: string;
  subject: string;
  module: string;
  title: string;
  content: string;
  assignment?: string;
  date: string;
}

const KEYS = {
  reports: "sms.discReports",
  cases: "sms.discCases",
  notes: "sms.subjectNotes",
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

const listeners = new Map<string, Set<() => void>>();

function subscribe(key: string, cb: () => void) {
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key)!.add(cb);
  return () => {
    listeners.get(key)?.delete(cb);
  };
}

function emit(key: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("sms-store-" + key));
  listeners.get(key)?.forEach((cb) => cb());
}

function useStore<T>(key: string, fallback: T): [T, (next: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => read(key, fallback));

  useEffect(() => {
    const onChange = () => setValue(read(key, fallback));
    const unsub = subscribe(key, onChange);
    window.addEventListener("sms-store-" + key, onChange);
    return () => {
      unsub();
      window.removeEventListener("sms-store-" + key, onChange);
    };
  }, [key, fallback]);

  const set = (next: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      if (typeof window !== "undefined") {
        localStorage.setItem(key, JSON.stringify(resolved));
      }
      emit(key);
      return resolved;
    });
  };

  return [value, set];
}

export function useDiscReports() {
  return useStore<DiscReport[]>(KEYS.reports, []);
}

export function useDiscCases() {
  return useStore<DiscCase[]>(KEYS.cases, []);
}

export function useSubjectNotes(subject: string) {
  const [notes, setNotes] = useStore<SubjectNote[]>(KEYS.notes, []);
  const subjectNotes = notes.filter((n) => n.subject === subject);
  const setSubjectNotes = (next: SubjectNote[]) => {
    setNotes((all) => {
      const others = all.filter((n) => n.subject !== subject);
      return [...others, ...next];
    });
  };
  return [subjectNotes, setSubjectNotes] as const;
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}
