"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import NotificationCenterModal from "@/components/notifications/NotificationCenterModal";

export default function NotificationBell() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { unreadCount } = useNotifications("all");

  return (
    <>
      {/* 🔔 Navbar Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsModalOpen(true)}
        className="relative h-9 w-9 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition border border-slate-200/80 cursor-pointer"
        aria-label="View notifications center"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-600 text-[10px] font-black text-white ring-2 ring-white animate-in zoom-in-50">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {/* 🎯 Centered Notification Modal */}
      <NotificationCenterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
