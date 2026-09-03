"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
}

export function Tabs({ tabs }: TabsProps) {
  const [active, setActive] = useState(tabs[0]?.id);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <div>
      <div className="flex items-center gap-1 border-b border-border-light mb-4 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              "px-4 py-2.5 text-sm whitespace-nowrap transition-colors border-b-2 -mb-px",
              tab.id === current.id
                ? "text-primary border-primary font-medium"
                : "text-text-muted border-transparent hover:text-text-dark hover:border-border-light"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {current.content}
    </div>
  );
}
