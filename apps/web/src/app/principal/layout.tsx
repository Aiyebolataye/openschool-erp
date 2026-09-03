"use client";

import { WorkspaceLayout } from "@/components/layout/workspace-layout";
import { principalNav } from "./nav";

export default function PrincipalLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceLayout
      workspace="Principal / Head Teacher"
      brand="Greenfield Academy"
      user={{ name: "Dr. Okon", role: "Principal", initials: "DO" }}
      navigation={principalNav}
      accent="primary"
    >
      {children}
    </WorkspaceLayout>
  );
}
