"use client";

import { WorkspaceLayout } from "@/components/layout/workspace-layout";
import { studentManagementNav } from "./nav";

export default function StudentManagementLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceLayout
      workspace="Student Management"
      brand="Greenfield Academy"
      user={{ name: "Mrs. Adaeze Chukwu", role: "Student Management Officer", initials: "AC" }}
      navigation={studentManagementNav}
    >
      {children}
    </WorkspaceLayout>
  );
}