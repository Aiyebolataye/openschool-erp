"use client";

import { WorkspaceLayout } from "@/components/layout/workspace-layout";
import { librarianNav } from "./nav";

export default function LibrarianLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceLayout
      workspace="Librarian"
      brand="Demo Academy"
      user={{ name: "Funke Adebayo", role: "Librarian", initials: "FA" }}
      navigation={librarianNav}
      accent="teal"
    >
      {children}
    </WorkspaceLayout>
  );
}
