"use client";

import { WorkspaceLayout } from "@/components/layout/workspace-layout";
import { parentNav } from "./nav";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceLayout
      workspace="Parent Portal"
      brand="Greenfield Academy"
      user={{ name: "Mr. Eze", role: "Parent / Guardian", initials: "ME" }}
      navigation={parentNav}
    >
      {children}
    </WorkspaceLayout>
  );
}
