"use client";

import { usePathname } from "next/navigation";
import { X } from "lucide-react";

import { NAVIGATION } from "@/constants";
import { Button } from "@/components/ui/button";
import { SidebarHeader, SidebarGroup } from ".";

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex h-screen w-72 flex-col border-r bg-background transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between pr-4 lg:block lg:pr-0">
        <SidebarHeader />

        {/* Close Button on Mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onClose}
          aria-label="Close Sidebar"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <nav className="flex-1 space-y-8 overflow-y-auto px-4 py-6">
        {NAVIGATION.map((group) => (
          <SidebarGroup
            key={group.title}
            title={group.title}
            items={group.items}
            pathname={pathname}
            onItemClick={onClose}
          />
        ))}
      </nav>
    </aside>
  );
}
