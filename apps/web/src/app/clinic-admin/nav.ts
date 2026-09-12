import type { NavItem } from "@/components/layout/workspace-layout";

export const clinicAdminNav: NavItem[] = [
  { label: "Dashboard", href: "/clinic-admin" },
  { label: "Sick Bay / Visits", href: "/clinic-admin/visits" },
  { label: "Medications", href: "/clinic-admin/medications" },
  { label: "Immunization Records", href: "/clinic-admin/immunizations" },
  { label: "Referrals", href: "/clinic-admin/referrals" },
  { label: "Communication", href: "/clinic-admin/communication" },
  { label: "Profile", href: "/clinic-admin/profile" },
];
