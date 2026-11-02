"use client";

import { useState, useMemo, useEffect } from "react";
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
  X,
  Trash2,
  Search,
  Check,
  Sparkles,
  ArrowRight,
  Maximize2,
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

export default function NotificationCenterModal({ isOpen, onClose }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all"); // "all" | "unread" | "ASSESSMENT" | "CANDIDATE"
  const [searchQuery, setSearchQuery] = useState("");

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isMarkingAll,
  } = useNotifications(activeTab === "unread" ? "unread" : "all");

  // Keyboard accessibility: ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Client-side filtering by tab & search query
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      // Tab filter
      if (activeTab === "unread" && notif.isRead) return false;
      if (activeTab === "ASSESSMENT" && notif.type !== "ASSESSMENT") return false;
      if (activeTab === "CANDIDATE" && notif.type !== "CANDIDATE") return false;

      // Search filter
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

  if (!isOpen) return null;

  const handleItemClick = (notif) => {
    if (!notif.isRead) {
      markAsRead(notif.id);
    }
  };

  const handleOpenFullPage = () => {
    onClose();
    router.push("/notifications");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Main Centered Dialog Box */}
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 z-10"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-center-title"
      >
        {/* ============================================================== */}
        {/* Modal Header */}
        {/* ============================================================== */}
        <div className="px-6 py-4 border-b border-slate-100 bg-linear-to-r from-slate-50 via-white to-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="notification-center-title" className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Notification Center
                </h2>
                {unreadCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200 animate-pulse">
                    {unreadCount} unread
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <Check className="h-3 w-3" /> All caught up
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 hidden sm:block mt-0.5">
                Real-time updates on candidate tests, evaluations, and recruitment events
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllAsRead()}
                disabled={isMarkingAll}
                className="h-8 text-xs font-semibold rounded-xl border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 transition cursor-pointer gap-1.5"
              >
                <CheckCheck className="h-3.5 w-3.5 text-indigo-600" />
                <span>Mark all read</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={handleOpenFullPage}
              title="Open full page"
              className="h-8 w-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              title="Close modal"
              className="h-8 w-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* Search & Filter Bar */}
        {/* ============================================================== */}
        <div className="px-6 py-3 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
                activeTab === "all"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              All Notifications
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("unread")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeTab === "unread"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <span>Unread</span>
              {unreadCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === "unread" ? "bg-white text-slate-900" : "bg-rose-500 text-white"
                }`}>
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ASSESSMENT")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
                activeTab === "ASSESSMENT"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Assessments
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("CANDIDATE")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
                activeTab === "CANDIDATE"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Candidates
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-56 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate, test..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* Scrollable Notification Cards List */}
        {/* ============================================================== */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100/80 p-2 sm:p-4 space-y-2 bg-slate-50/30">
          {isLoading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs font-semibold text-slate-500">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-16 px-4 text-center flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-slate-200 my-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mb-3">
                <Bell className="h-7 w-7 stroke-1" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No notifications found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                {searchQuery
                  ? `No notifications match "${searchQuery}". Try a different keyword.`
                  : activeTab === "unread"
                  ? "Great job! You have zero unread notifications."
                  : "When candidates submit assessments or recruiters send invites, they will appear here in real time."}
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
                  className={`group relative rounded-2xl p-4 transition-all duration-150 cursor-pointer border ${
                    notif.isRead
                      ? "bg-white hover:bg-slate-50/80 border-slate-200/70 shadow-xs"
                      : "bg-indigo-50/40 hover:bg-indigo-50/60 border-indigo-200/70 shadow-xs"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Visual Icon Avatar */}
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${visuals.bg}`}
                    >
                      {visuals.icon}
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                        <h4
                          className={`text-sm truncate leading-tight ${
                            notif.isRead
                              ? "font-bold text-slate-800"
                              : "font-black text-slate-950"
                          }`}
                        >
                          {notif.title}
                        </h4>

                        {/* Timestamp */}
                        <span className="text-[11px] text-slate-400 font-medium shrink-0">
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                      </div>

                      {/* Main Message */}
                      <p className="text-xs text-slate-600 leading-relaxed font-normal mt-0.5">
                        {notif.message}
                      </p>

                      {/* Action buttons (Delete & Toggle Read) */}
                      <div className="mt-2 flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition">
                        {!notif.isRead && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notif.id);
                            }}
                            title="Mark as read"
                            className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                          >
                            Mark read
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif.id);
                          }}
                          title="Delete notification"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Unread Indicator Pulse */}
                    {!notif.isRead && (
                      <span
                        className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0 mt-1.5 ring-4 ring-indigo-100 shadow-xs"
                        title="Unread"
                      />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ============================================================== */}
        {/* Modal Footer */}
        {/* ============================================================== */}
        <div className="px-6 py-3 border-t border-slate-100 bg-white flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span>Showing {filteredNotifications.length} of {notifications.length} events</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleOpenFullPage}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer transition"
            >
              <span>View full screen page</span>
              <ExternalLink className="h-3 w-3" />
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 text-xs font-semibold rounded-xl border-slate-200 hover:bg-slate-50 cursor-pointer"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

