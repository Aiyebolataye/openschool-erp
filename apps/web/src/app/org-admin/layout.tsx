"use client";

import { WorkspaceLayout } from "@/components/layout/workspace-layout";
import { orgAdminNav } from "./nav";

export default function OrgAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceLayout
      workspace="Organization Administrator"
      brand="School ERP"
      user={{ name: "Executive Director", role: "Org Admin", initials: "ED" }}
      navigation={orgAdminNav}
    >
      {children}
    </WorkspaceLayout>
  );
}
