"use client";

import { WorkspaceLayout } from "@/components/layout/workspace-layout";
import { teacherNav } from "./nav";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceLayout
      workspace="Teacher"
      brand="Demo Academy"
      user={{ name: "Mrs. Ajayi", role: "Biology Teacher", initials: "AA" }}
      navigation={teacherNav}
    >
      {children}
    </WorkspaceLayout>
  );
}
