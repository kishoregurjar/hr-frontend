"use client";

import { useState, useMemo } from "react";
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
  Trash2,
  RefreshCw,
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
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getNotificationVisuals(type) {
  switch (type) {
    case "ASSESSMENT":
      return {
        icon: <ClipboardCheck className="h-5 w-5 text-indigo-600" />,
        bg: "bg-indigo-50 border-indigo-100",
        badge: "Assessment",
        badgeColor: "bg-indigo-100/70 text-indigo-700 border-indigo-200",
      };
    case "PROCTORING":
      return {
        icon: <ShieldAlert className="h-5 w-5 text-rose-600" />,
        bg: "bg-rose-50 border-rose-100",
        badge: "Security & Proctor",
        badgeColor: "bg-rose-100/70 text-rose-700 border-rose-200",
      };
    case "CANDIDATE":
      return {
        icon: <UserCheck className="h-5 w-5 text-emerald-600" />,
        bg: "bg-emerald-50 border-emerald-100",
        badge: "Candidate",
        badgeColor: "bg-emerald-100/70 text-emerald-700 border-emerald-200",
      };
    case "TEAM":
      return {
        icon: <Users className="h-5 w-5 text-blue-600" />,
        bg: "bg-blue-50 border-blue-100",
        badge: "Team",
        badgeColor: "bg-blue-100/70 text-blue-700 border-blue-200",
      };
    case "SUPPORT":
      return {
        icon: <LifeBuoy className="h-5 w-5 text-purple-600" />,
        bg: "bg-purple-50 border-purple-100",
        badge: "Support",
        badgeColor: "bg-purple-100/70 text-purple-700 border-purple-200",
      };
    default:
      return {
        icon: <Info className="h-5 w-5 text-slate-500" />,
        bg: "bg-slate-50 border-slate-100",
        badge: "General",
        badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
      };
  }
}

export default function NotificationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");

  const {
    notifications,
    unreadCount,
    isLoading,
    refetch,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    isMarkingAll,
    isClearingAll,
  } = useNotifications(activeTab === "unread" ? "unread" : "all");

  const filteredNotifications = useMemo(() => {
    if (activeTab === "unread") {
      return notifications.filter((notif) => !notif.isRead);
    }
    return notifications;
  }, [notifications, activeTab]);

  const handleItemClick = (notif) => {
    if (!notif.isRead) {
      markAsRead(notif.id);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ============================================================== */}
      {/* Top Banner Header */}
      {/* ============================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#4E35E8] via-[#6D38F0] to-[#CF2E9F] p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/15">
        {/* Decorative Background Orbs & Concentric Rings */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/15 blur-2xl" />
          <div className="absolute -top-12 -right-12 w-72 h-72 rounded-full border border-white/20" />
          <div className="absolute top-8 right-16 w-52 h-52 rounded-full border border-white/15" />
          <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-white/40 blur-[1px] animate-pulse" />
          <div className="absolute top-1/3 left-2/3 w-2.5 h-2.5 rounded-full bg-pink-200/50 blur-[1px] animate-pulse" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-xs font-semibold text-white mb-3 shadow-xs">
              <Bell className="h-3.5 w-3.5 text-indigo-100" />
              <span>Activity &amp; Notification Feed</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-sm">
              Notifications
            </h1>
            <p className="text-white/85 text-xs sm:text-sm mt-1 max-w-xl font-medium">
              Track real-time candidate test completions, proctoring security alerts, and assessment invitations.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-center">
            {unreadCount > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => markAllAsRead()}
                disabled={isMarkingAll}
                className="bg-white text-indigo-900 hover:bg-slate-50 font-bold rounded-full shadow-xs text-xs cursor-pointer gap-1.5 px-4 h-9"
              >
                <CheckCheck className="h-4 w-4 text-indigo-600" />
                <span>Mark All Read</span>
              </Button>
            )}

            {notifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => clearAll()}
                disabled={isClearingAll}
                className="bg-white/10 hover:bg-rose-600/80 hover:border-rose-400 text-white border-white/20 rounded-2xl text-xs cursor-pointer gap-1.5 transition"
              >
                <Trash2 className="h-3.5 w-3.5 text-rose-300" />
                <span>Clear All</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="bg-white/15 hover:bg-white/25 text-white border-white/25 rounded-full text-xs font-semibold cursor-pointer gap-1.5 px-4 h-9 backdrop-blur-md shadow-xs transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* Main Container Card */}
      {/* ============================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "all"
                  ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/25"
                  : "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60 font-semibold"
              }`}
            >
              All Notifications ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("unread")}
              className={`px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-2 ${
                activeTab === "unread"
                  ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/25"
                  : "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60 font-semibold"
              }`}
            >
              <span>Unread</span>
              {unreadCount > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-tight ${
                    activeTab === "unread"
                      ? "bg-white/20 text-white"
                      : "bg-rose-600 text-white"
                  }`}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-slate-100/80 p-3 sm:p-6 space-y-3 bg-slate-50/20">
          {isLoading ? (
            <div className="py-24 text-center flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs font-semibold text-slate-500">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-20 px-4 text-center flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50/80 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-3 shadow-xs">
                <Bell className="h-8 w-8 stroke-[1.5]" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No notifications to show</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                {activeTab === "unread"
                  ? "All caught up! You have no unread notifications."
                  : "New notifications will appear here when candidates submit assessments."}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const visuals = getNotificationVisuals(notif.type);

              return (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`group relative rounded-2xl px-4 py-3 transition-all duration-150 cursor-pointer border ${
                    notif.isRead
                      ? "bg-white hover:bg-slate-50/90 border-slate-200/70"
                      : "bg-indigo-50/30 hover:bg-indigo-50/60 border-indigo-200/80"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Visual Icon Avatar */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${visuals.bg}`}
                    >
                      {visuals.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex items-center gap-2.5">
                      <p
                        className={`text-sm truncate ${
                          notif.isRead
                            ? "text-slate-600 font-normal"
                            : "text-slate-900 font-semibold"
                        }`}
                      >
                        {notif.message}
                      </p>
                      <span className="text-xs text-slate-400 font-medium shrink-0">
                        • {formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div
                      className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {!notif.isRead && (
                        <button
                          type="button"
                          onClick={() => markAsRead(notif.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition"
                        >
                          Mark read
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteNotification(notif.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      {!notif.isRead && (
                        <span
                          className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 ml-1"
                          title="Unread"
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
