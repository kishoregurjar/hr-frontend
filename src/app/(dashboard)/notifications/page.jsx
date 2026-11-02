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
  Search,
  Check,
  ArrowRight,
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
  const diffInHours = Math.floor(diffInSeconds / 60);
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
  const [searchQuery, setSearchQuery] = useState("");

  const {
    notifications,
    unreadCount,
    isLoading,
    refetch,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isMarkingAll,
  } = useNotifications(activeTab === "unread" ? "unread" : "all");

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      if (activeTab === "unread" && notif.isRead) return false;
      if (activeTab === "ASSESSMENT" && notif.type !== "ASSESSMENT") return false;
      if (activeTab === "CANDIDATE" && notif.type !== "CANDIDATE") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = notif.title?.toLowerCase().includes(q);
        const matchesMessage = notif.message?.toLowerCase().includes(q);
        const matchesCandidate = notif.metadata?.candidateName?.toLowerCase().includes(q);
        const matchesAssessment = notif.metadata?.assessmentTitle?.toLowerCase().includes(q);
        return matchesTitle || matchesMessage || matchesCandidate || matchesAssessment;
      }
      return true;
    });
  }, [notifications, activeTab, searchQuery]);

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
        {/* Filter & Search Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "all"
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/25 ring-2 ring-indigo-600/20"
                  : "bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-50 hover:text-slate-900 shadow-xs"
              }`}
            >
              All Notifications ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("unread")}
              className={`px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-2 ${
                activeTab === "unread"
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/25 ring-2 ring-indigo-600/20"
                  : "bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-50 hover:text-slate-900 shadow-xs"
              }`}
            >
              <span>Unread</span>
              {unreadCount > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-tight ${
                    activeTab === "unread"
                      ? "bg-white/25 text-white"
                      : "bg-rose-500 text-white"
                  }`}
                >
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ASSESSMENT")}
              className={`px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "ASSESSMENT"
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/25 ring-2 ring-indigo-600/20"
                  : "bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-50 hover:text-slate-900 shadow-xs"
              }`}
            >
              Assessments
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("CANDIDATE")}
              className={`px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "CANDIDATE"
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/25 ring-2 ring-indigo-600/20"
                  : "bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-50 hover:text-slate-900 shadow-xs"
              }`}
            >
              Candidates
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by candidate, title..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200/90 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition font-medium placeholder:text-slate-400 shadow-xs"
            />
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
                {searchQuery
                  ? `No results found for "${searchQuery}".`
                  : activeTab === "unread"
                  ? "All caught up! You have no unread notifications."
                  : "New notifications will appear here when candidates submit assessments."}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const visuals = getNotificationVisuals(notif.type);
              const score = notif.metadata?.score;

              return (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`group relative rounded-3xl p-5 transition-all duration-150 cursor-pointer border ${
                    notif.isRead
                      ? "bg-white hover:bg-slate-50/80 border-slate-200/70 shadow-xs"
                      : "bg-indigo-50/30 hover:bg-indigo-50/50 border-indigo-200/80 shadow-xs"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Visual Icon Avatar */}
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${visuals.bg}`}
                    >
                      {visuals.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                        <h3
                          className={`text-sm sm:text-base truncate leading-tight ${
                            notif.isRead
                              ? "font-bold text-slate-800"
                              : "font-black text-slate-950"
                          }`}
                        >
                          {notif.title}
                        </h3>

                        {/* Timestamp */}
                        <span className="text-xs text-slate-400 font-medium shrink-0">
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                      </div>

                      <p className="text-sm text-slate-600 leading-relaxed font-normal">
                        {notif.message}
                      </p>

                      {/* Actions */}
                      <div className="mt-2.5 flex items-center justify-end gap-2">
                        <div
                          className="flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {!notif.isRead && (
                            <button
                              type="button"
                              onClick={() => markAsRead(notif.id)}
                              className="px-3 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100/80 rounded-full border border-indigo-200/60 transition cursor-pointer"
                            >
                              Mark as read
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => deleteNotification(notif.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {!notif.isRead && (
                      <span
                        className="w-3 h-3 rounded-full bg-indigo-600 shrink-0 mt-2 ring-4 ring-indigo-100 shadow-xs"
                        title="Unread"
                      />
                    )}
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

