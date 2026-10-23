"use client";

import { WorkspaceLayout } from "@/components/layout/workspace-layout";
import { institutionAdminNav } from "./nav";

export default function InstitutionLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceLayout
      workspace="Institution Administrator"
      brand="Demo Academy"
      user={{ name: "Sarah Mitchell", role: "Institution Admin", initials: "SM" }}
      navigation={institutionAdminNav}
    >
      {children}
    </WorkspaceLayout>
  );
}
