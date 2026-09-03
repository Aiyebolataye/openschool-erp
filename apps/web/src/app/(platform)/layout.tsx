import { TopNav } from "@/components/layout/top-nav";
import { Sidebar } from "@/components/layout/sidebar";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-surface p-6">{children}</main>
      </div>
    </div>
  );
}
