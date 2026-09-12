"use client";

import { WorkspaceLayout } from "@/components/layout/workspace-layout";
import { hostelAdminNav } from "./nav";

export default function HostelAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceLayout
      workspace="Hostel Administrator"
      brand="Red House — Boys"
      user={{ name: "Mr. Okoye", role: "Hostel Admin · Red House", initials: "OK" }}
      navigation={hostelAdminNav}
      accent="orange"
    >
      {children}
    </WorkspaceLayout>
  );
}