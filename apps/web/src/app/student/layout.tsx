"use client";

import { WorkspaceLayout } from "@/components/layout/workspace-layout";
import { studentNav } from "./nav";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceLayout
      workspace="Student Portal"
      brand="Greenfield Academy"
      user={{ name: "Chidi Eze", role: "SS1 Science", initials: "CE" }}
      navigation={studentNav}
      accent="green"
    >
      {children}
    </WorkspaceLayout>
  );
}
