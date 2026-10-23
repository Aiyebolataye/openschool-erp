"use client";

import { WorkspaceLayout } from "@/components/layout/workspace-layout";
import { transportManagerNav } from "./nav";

export default function TransportManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceLayout
      workspace="Transport Manager"
      brand="Demo Academy"
      user={{ name: "Mr. Musa Idris", role: "Transport Manager", initials: "MI" }}
      navigation={transportManagerNav}
      accent="teal"
    >
      {children}
    </WorkspaceLayout>
  );
}
