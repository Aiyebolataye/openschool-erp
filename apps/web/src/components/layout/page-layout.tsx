import { TopNav } from "./top-nav";
import { Sidebar } from "./sidebar";

interface PageLayoutProps {
  children: React.ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="flex flex-col h-screen">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-surface p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
