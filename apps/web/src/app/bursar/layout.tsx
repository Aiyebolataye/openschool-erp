"use client";

import { WorkspaceLayout } from "@/components/layout/workspace-layout";
import { bursarNav } from "./nav";

export default function BursarLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceLayout
      workspace="Bursar"
      brand="Greenfield Academy"
      user={{ name: "Mrs. Chiamaka Okafor", role: "Bursar", initials: "CO" }}
      navigation={bursarNav}
    >
      {children}
    </WorkspaceLayout>
  );
}