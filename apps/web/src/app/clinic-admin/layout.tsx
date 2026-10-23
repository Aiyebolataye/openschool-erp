"use client";

import { WorkspaceLayout } from "@/components/layout/workspace-layout";
import { clinicAdminNav } from "./nav";

export default function ClinicAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceLayout
      workspace="School Nurse"
      brand="Demo Academy"
      user={{ name: "Nurse Adaeze Okafor", role: "School Nurse", initials: "AO" }}
      navigation={clinicAdminNav}
      accent="green"
    >
      {children}
    </WorkspaceLayout>
  );
}
