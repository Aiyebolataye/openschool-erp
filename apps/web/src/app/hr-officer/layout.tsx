"use client";

import { WorkspaceLayout } from "@/components/layout/workspace-layout";
import { hrOfficerNav } from "./nav";

export default function HrOfficerLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceLayout
      workspace="HR & Payroll"
      brand="Demo Academy"
      user={{ name: "Mrs. Ngozi Bello", role: "Payroll Officer", initials: "NB" }}
      navigation={hrOfficerNav}
    >
      {children}
    </WorkspaceLayout>
  );
}
