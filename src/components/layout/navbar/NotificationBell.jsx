"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  ClipboardCheck,
  ShieldAlert,
  UserCheck,
  Users,
  LifeBuoy,
  Info,
  ExternalLink,
} from "lucide-react";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { Button } from "@/components/ui/button";

function formatRelativeTime(dateString) {
  if (!dateString) return "";
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getNotificationIcon(type) {
  switch (type) {
    case "ASSESSMENT":
      return <ClipboardCheck className="h-4 w-4 text-indigo-600 shrink-0" />;
    case "PROCTORING":
      return <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />;
    case "CANDIDATE":
      return <UserCheck className="h-4 w-4 text-emerald-600 shrink-0" />;
    case "TEAM":
      return <Users className="h-4 w-4 text-blue-600 shrink-0" />;
    case "SUPPORT":
      return <LifeBuoy className="h-4 w-4 text-purple-600 shrink-0" />;
    default:
      return <Info className="h-4 w-4 text-slate-500 shrink-0" />;
  }
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "unread"
  const dropdownRef = useRef(null);
  const router = useRouter();

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    isMarkingAll,
  } = useNotifications(activeTab);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) {
      markAsRead(notif.id);
    }
    if (notif.link) {
      setIsOpen(false);
      router.push(notif.link);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 🔔 Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative h-9 w-9 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition border border-slate-200/80 cursor-pointer"
        aria-label="View notifications"
        aria-expanded={isOpen}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-600 text-[10px] font-black text-white ring-2 ring-white animate-in zoom-in-50">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {/* 📋 Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllAsRead()}
                disabled={isMarkingAll}
                className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition cursor-pointer disabled:opacity-50"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="px-3 pt-2 pb-1 flex items-center gap-1 border-b border-slate-100 bg-white">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === "all"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("unread")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "unread"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <span>Unread</span>
              {unreadCount > 0 && (
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              )}
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
            {isLoading ? (
              <div className="py-8 text-center text-xs text-slate-400 font-medium">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <div className="mx-auto w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                  <Bell className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-slate-700">No notifications</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {activeTab === "unread"
                    ? "You're all caught up with unread items."
                    : "When events happen, you'll see them here."}
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 flex items-start gap-3 transition cursor-pointer ${
                    notif.isRead
                      ? "hover:bg-slate-50/80 bg-white"
                      : "bg-indigo-50/30 hover:bg-indigo-50/50"
                  }`}
                >
                  {/* Icon Avatar */}
                  <div className="p-2 rounded-xl bg-slate-100/90 shrink-0 mt-0.5 border border-slate-200/60">
                    {getNotificationIcon(notif.type)}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className={`text-xs font-bold truncate leading-tight ${
                        notif.isRead ? "text-slate-800" : "text-slate-950 font-extrabold"
                      }`}>
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>

                    <p className="text-[11.5px] text-slate-600 leading-snug line-clamp-2">
                      {notif.message}
                    </p>

                    {notif.link && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-indigo-600">
                        <span>View details</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </div>
                    )}
                  </div>

                  {/* Unread Indicator Dot */}
                  {!notif.isRead && (
                    <span className="h-2 w-2 rounded-full bg-indigo-600 shrink-0 mt-1.5 shadow-xs" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
