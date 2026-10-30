"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Ticket,
  Clock,
  Send,
  RefreshCw,
  Inbox,
  User,
  Mail,
  X,
  Search,
  CheckCircle2,
  MoreHorizontal,
  CircleDashed,
  ShieldAlert,
  Loader2,
  Reply,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/context";
import {
  getCompanySupportRequests,
  updateCompanySupportStatus,
  replyCompanySupportRequest,
} from "@/lib/api/support";

const STATUS_CONFIG = {
  OPEN: {
    label: "Open",
    color: "bg-amber-50 text-amber-700 border-amber-200/60",
    dot: "bg-amber-500",
    icon: CircleDashed,
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "bg-blue-50 text-blue-700 border-blue-200/60",
    dot: "bg-blue-500",
    icon: MoreHorizontal,
  },
  RESOLVED: {
    label: "Resolved",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },
};

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
];

export default function CompanySupportTicketsPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Scroll & 3D Parallax Refs
  const scrollContainerRef = useRef(null);
  const farBgRef = useRef(null);
  const midHeroRef = useRef(null);
  const stat1Ref = useRef(null);
  const stat2Ref = useRef(null);
  const stat3Ref = useRef(null);
  const stat4Ref = useRef(null);

  // State
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scroll when drawer is open so user can smoothly scroll drawer contents
  useEffect(() => {
    if (selectedRequest) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [selectedRequest]);

  // Determine active company role
  const activeCompanyRole =
    user?.activeCompany?.role ||
    user?.companies?.[0]?.role ||
    user?.companyRole ||
    (user?.isOwner ? "OWNER" : "") ||
    (typeof window !== "undefined"
      ? localStorage.getItem("active_company_role") ||
        localStorage.getItem("companyRole")
      : "") ||
    user?.role ||
    "";

  const isOwnerOrAdmin = Boolean(
    user?.isOwner ||
    user?.isAdmin ||
    String(activeCompanyRole).toUpperCase() === "OWNER" ||
    String(activeCompanyRole).toUpperCase() === "ADMIN" ||
    String(activeCompanyRole).toUpperCase() === "COMPANY_OWNER" ||
    String(activeCompanyRole).toUpperCase() === "COMPANY_ADMIN" ||
    user?.companyRole === "OWNER" ||
    user?.companyRole === "ADMIN" ||
    user?.role === "Company Owner" ||
    user?.role === "HR Admin"
  );

  const companyName =
    user?.companyName ||
    user?.company?.name ||
    (typeof window !== "undefined" ? localStorage.getItem("companyName") : null) ||
    "Facebook Company";

  // Reset page when search or filter changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter]);

  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = { limit: 100, sortOrder: "desc" };
      const data = await getCompanySupportRequests(params);
      setRequests(data.items || []);
    } catch (err) {
      toast.error(err?.message || "Failed to load company support tickets.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOwnerOrAdmin) {
      fetchRequests();
    } else {
      setIsLoading(false);
    }
  }, [fetchRequests, isOwnerOrAdmin]);

  // ── 3D Parallax Scroll Handler ──
  const handleScroll = () => {
    const scrollY = scrollContainerRef.current?.scrollTop || 0;

    // 1. Far background decorative rings & ambient orbs inside the hero card
    if (farBgRef.current) {
      const orbTranslate = scrollY * 0.55;
      const orbRotate = scrollY * 0.05;
      const orbScale = 1 + scrollY * 0.0003;
      farBgRef.current.style.transform = `translate3d(0, ${orbTranslate}px, 0) scale(${orbScale}) rotate(${orbRotate}deg)`;
    }

    // 2. Midground Hero Card moves slower than foreground cards (0.42x speed)
    if (midHeroRef.current) {
      const heroProgress = Math.min(scrollY / 450, 1);
      const heroTranslate = scrollY * 0.42;
      const heroOpacity = Math.max(1 - heroProgress * 0.75, 0.2);
      const heroScale = 1 - heroProgress * 0.06;
      midHeroRef.current.style.transform = `translate3d(0, ${heroTranslate}px, 0) scale(${heroScale})`;
      midHeroRef.current.style.opacity = heroOpacity;
    }

    // 3. Staggered individual parallax on stat boxes
    if (stat1Ref.current) stat1Ref.current.style.transform = `translate3d(0, ${scrollY * 0.08}px, 0)`;
    if (stat2Ref.current) stat2Ref.current.style.transform = `translate3d(0, ${scrollY * 0.14}px, 0)`;
    if (stat3Ref.current) stat3Ref.current.style.transform = `translate3d(0, ${scrollY * 0.20}px, 0)`;
    if (stat4Ref.current) stat4Ref.current.style.transform = `translate3d(0, ${scrollY * 0.26}px, 0)`;
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      setIsUpdatingStatus(true);
      await updateCompanySupportStatus(requestId, newStatus);
      toast.success(
        `Status updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}.`
      );
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r))
      );
      if (selectedRequest?.id === requestId) {
        setSelectedRequest((prev) =>
          prev ? { ...prev, status: newStatus } : prev
        );
      }
    } catch (err) {
      toast.error(err?.message || "Failed to update ticket status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedRequest) return;
    try {
      setIsReplying(true);
      const result = await replyCompanySupportRequest(
        selectedRequest.id,
        replyText.trim()
      );

      if (result?.emailSent === false) {
        toast.warning(
          "Reply saved, but email notification to the submitter could not be dispatched."
        );
      } else {
        toast.success("Reply saved and email sent to submitter!");
      }

      const updatedRequest = {
        ...selectedRequest,
        adminReply: replyText.trim(),
        repliedAt: new Date().toISOString(),
        status: "RESOLVED",
      };

      setReplyText("");
      setRequests((prev) =>
        prev.map((r) => (r.id === selectedRequest.id ? updatedRequest : r))
      );
      setSelectedRequest(updatedRequest);
    } catch (err) {
      toast.error(err?.message || "Failed to send reply.");
    } finally {
      setIsReplying(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const datePart = d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const timePart = d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${datePart} · ${timePart}`;
  };

  // If user is not Owner/Admin, block access with friendly UI
  if (!isOwnerOrAdmin && !isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-6 md:p-12 flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm space-y-4">
          <div className="h-14 w-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-100">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Support ticket administration is reserved for Company Owners and
            Administrators. To submit a personal request, please use the Help &
            Support page.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link href="/support">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                Go to Help & Support
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full text-slate-700 font-semibold">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Summary KPIs matching screenshot
  const stats = {
    total: requests.length,
    open: requests.filter((r) => r.status === "OPEN").length,
    inProgress: requests.filter((r) => r.status === "IN_PROGRESS").length,
    resolved: requests.filter((r) => r.status === "RESOLVED").length,
  };

  // Filtered requests
  const filteredRequests = requests.filter((req) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      req.subject?.toLowerCase().includes(q) ||
      req.user?.name?.toLowerCase().includes(q) ||
      req.user?.email?.toLowerCase().includes(q) ||
      req.message?.toLowerCase().includes(q);
    const matchesStatus = statusFilter ? req.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE) || 1;
  const paginatedRequests = filteredRequests.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div 
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="-m-4 md:-m-6 h-[calc(100dvh-64px)] max-h-[calc(100dvh-64px)] overflow-y-auto overflow-x-hidden relative bg-[#f8fafc] no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      {/* ── Layer 1 & 2: Top Floating 3D Parallax Hero Card ── */}
      <div className="pt-6 sm:pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div
          ref={midHeroRef}
          className="relative bg-gradient-to-r from-[#3826C7] via-[#5B37EB] to-[#0284C7] text-white rounded-3xl sm:rounded-4xl p-6 sm:p-8 lg:p-10 shadow-xl shadow-indigo-950/15 overflow-hidden select-none will-change-transform"
          style={{ transform: "translate3d(0, 0, 0)" }}
        >
          {/* Far Background Orbs & Rings inside the Hero Card */}
          <div
            ref={farBgRef}
            className="absolute inset-0 pointer-events-none will-change-transform"
            style={{ transform: "translate3d(0, 0, 0)" }}
          >
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/15 blur-2xl" />
            <div className="absolute -top-12 -right-12 w-72 h-72 rounded-full border border-white/20" />
            <div className="absolute top-8 right-16 w-52 h-52 rounded-full border border-white/15" />
          </div>

          <div className="relative z-10 space-y-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Support Tickets
              </h1>
              <p className="text-white/85 text-xs sm:text-sm font-medium mt-1">
                {companyName} &bull; team requests review karein aur reply karein
              </p>
            </div>

            {/* 4 Stat Boxes with Staggered Parallax */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div
                ref={stat1Ref}
                className="bg-white/12 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-2.5 min-w-[85px] sm:min-w-[95px] text-center shadow-xs will-change-transform"
              >
                <div className="text-xl sm:text-2xl font-black text-white">{stats.total}</div>
                <div className="text-[10px] sm:text-[11px] font-bold text-white/75 tracking-wider uppercase mt-0.5">
                  TOTAL
                </div>
              </div>

              <div
                ref={stat2Ref}
                className="bg-white/12 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-2.5 min-w-[85px] sm:min-w-[95px] text-center shadow-xs will-change-transform"
              >
                <div className="text-xl sm:text-2xl font-black text-white">{stats.open}</div>
                <div className="text-[10px] sm:text-[11px] font-bold text-white/75 tracking-wider uppercase mt-0.5">
                  OPEN
                </div>
              </div>

              <div
                ref={stat3Ref}
                className="bg-white/12 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-2.5 min-w-[85px] sm:min-w-[95px] text-center shadow-xs will-change-transform"
              >
                <div className="text-xl sm:text-2xl font-black text-white">{stats.inProgress}</div>
                <div className="text-[10px] sm:text-[11px] font-bold text-white/75 tracking-wider uppercase mt-0.5">
                  PROGRESS
                </div>
              </div>

              <div
                ref={stat4Ref}
                className="bg-white/12 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-2.5 min-w-[85px] sm:min-w-[95px] text-center shadow-xs will-change-transform"
              >
                <div className="text-xl sm:text-2xl font-black text-white">{stats.resolved}</div>
                <div className="text-[10px] sm:text-[11px] font-bold text-white/75 tracking-wider uppercase mt-0.5">
                  RESOLVED
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Layer 3: Foreground (1.0x Normal Speed - Search, Filter, and Ticket Cards) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 space-y-5 relative z-20">
        
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search by subject, name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200/90 rounded-full h-11 px-5 text-xs sm:text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium placeholder:text-slate-400"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatusFilter(opt.value)}
                className={`px-5 py-2 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap shadow-xs ${
                  statusFilter === opt.value
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50"
                }`}
              >
                {opt.label}
              </button>
            ))}

            <button
              type="button"
              onClick={fetchRequests}
              disabled={isLoading}
              title="Refresh tickets list"
              className="p-2.5 rounded-full border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-600 transition shadow-xs cursor-pointer ml-1"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-indigo-600" : ""}`} />
            </button>
          </div>
        </div>

        {/* Ticket Cards List */}
        {isLoading ? (
          <div className="space-y-4 pt-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse bg-white rounded-3xl border border-slate-200/80 p-6 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 w-1/2">
                    <div className="h-11 w-11 bg-slate-200 rounded-2xl" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-slate-200 rounded w-2/3" />
                      <div className="h-3 bg-slate-100 rounded w-1/3" />
                    </div>
                  </div>
                  <div className="h-6 w-20 bg-slate-200 rounded-full" />
                </div>
                <div className="h-9 bg-slate-100 rounded-xl w-1/3" />
                <div className="h-4 bg-slate-100 rounded w-1/4 pt-2" />
              </div>
            ))}
          </div>
        ) : paginatedRequests.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center flex flex-col items-center justify-center space-y-3 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mb-1">
              <Inbox className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No support tickets found</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              {searchQuery || statusFilter
                ? "Try adjusting your search criteria or status filter."
                : "When team members submit support requests, they will appear here for review."}
            </p>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            {paginatedRequests.map((req) => {
              const statusCfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.OPEN;
              const initials = (req.user?.name || "HR")
                .split(" ")
                .filter(Boolean)
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <div
                  key={req.id}
                  className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-[0_10px_30px_rgba(79,70,229,0.06),0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-lg transition-all duration-200 space-y-4"
                >
                  {/* Top Section */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      {/* Initials Avatar */}
                      <div className="h-11 w-11 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
                        {initials}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-bold text-slate-900 truncate">
                          {req.subject}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {req.user?.name || "Team Member"} &bull; {req.user?.email || "—"}
                        </p>

                        {/* Message snippet bubble */}
                        <div className="mt-3 bg-slate-50 border border-slate-100/90 rounded-xl px-4 py-2.5 text-xs text-slate-600 font-mono tracking-wide max-w-md inline-block">
                          {req.message}
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusCfg.color}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                        {statusCfg.label}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Row */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{formatDate(req.createdAt)}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRequest(req);
                        setReplyText(req.adminReply || "");
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-600 font-bold text-xs transition cursor-pointer shadow-2xs hover:shadow-xs"
                    >
                      <span>Reply</span>
                      <Reply className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-xs text-slate-500 font-medium">
              Page {page} of {totalPages} ({filteredRequests.length} total)
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 text-xs font-semibold px-3 rounded-full"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-8 text-xs font-semibold px-3 rounded-full"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Slide-Over Detail Drawer (Mounted to document.body via Portal) ── */}
      {mounted && selectedRequest && createPortal(
        <div className="fixed inset-0 z-[100] overflow-hidden flex justify-end font-sans">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => {
              setSelectedRequest(null);
              setReplyText("");
            }}
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-2xl bg-white shadow-2xl h-full flex flex-col z-10 border-l border-white/90 animate-in slide-in-from-right duration-200">
            {/* ── 1. Top Hero Header with 3D Parallax Gradient ── */}
            <div className="shrink-0 bg-gradient-to-r from-[#4E35E8] via-[#6D38F0] to-[#CF2E9F] p-6 text-white relative overflow-hidden select-none shadow-md">
              {/* Subtle Ambient 3D Glow Accents */}
              <div className="absolute -top-14 -right-14 h-40 w-40 rounded-full bg-white/15 blur-2xl pointer-events-none" />
              <div className="absolute top-1/2 left-1/3 h-20 w-20 rounded-full bg-pink-300/10 blur-xl pointer-events-none" />

              {/* Close Button on Top Right */}
              <button
                type="button"
                onClick={() => {
                  setSelectedRequest(null);
                  setReplyText("");
                }}
                className="absolute top-4 right-4 h-8.5 w-8.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer z-20"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3.5 relative z-10 pr-8">
                <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center font-bold shadow-inner shrink-0">
                  <Ticket className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-extrabold text-white tracking-tight drop-shadow-xs">
                      Ticket Details
                    </h2>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-2xs">
                      <Sparkles className="h-2.5 w-2.5 text-pink-200" />
                      #{selectedRequest.id ? String(selectedRequest.id).slice(-6).toUpperCase() : "TICKET"}
                    </span>
                  </div>
                  <p className="text-xs text-white/85 mt-0.5 font-medium leading-relaxed truncate max-w-md">
                    Manage recruiter inquiry, review question report, and dispatch resolution response.
                  </p>
                </div>
              </div>
            </div>

            {/* ── 2. Drawer Content (Dedicated Scrollable Viewport with Zero Ugly Scrollbars) ── */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {/* Subject & Status */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Ticket Subject
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                      {selectedRequest.subject}
                    </h3>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shrink-0 shadow-2xs ${
                      STATUS_CONFIG[selectedRequest.status]?.color ||
                      STATUS_CONFIG.OPEN.color
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${STATUS_CONFIG[selectedRequest.status]?.dot || "bg-amber-500"}`} />
                    {STATUS_CONFIG[selectedRequest.status]?.label}
                  </span>
                </div>
              </div>

              {/* Submitter Metadata Card */}
              <div className="bg-gradient-to-r from-slate-50 to-indigo-50/30 border border-slate-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#4E35E8] to-[#CF2E9F] text-white flex items-center justify-center text-xs font-black shadow-md shadow-indigo-500/20 shrink-0">
                    {(selectedRequest.user?.name || "HR")
                      .split(" ")
                      .filter(Boolean)
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-slate-900 truncate">
                      {selectedRequest.user?.name || "Team Member"}
                    </p>
                    <p className="text-xs text-slate-500 font-medium truncate">
                      {selectedRequest.user?.email}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-500 font-medium sm:text-right bg-white border border-slate-200/80 px-3 py-1.5 rounded-xl shadow-2xs shrink-0">
                  <p className="flex items-center sm:justify-end gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-indigo-600" />
                    Submitted: <strong className="text-slate-800">{formatDate(selectedRequest.createdAt)}</strong>
                  </p>
                </div>
              </div>

              {/* Quick Status Toggles */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span>Update Status</span>
                  <span className="text-slate-400 font-normal text-[11px]">(Click to switch)</span>
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: "OPEN", label: "Set Open", icon: "🟡", activeStyle: "bg-amber-50 text-amber-900 border-amber-300 ring-2 ring-amber-500/20 shadow-2xs font-bold" },
                    { id: "IN_PROGRESS", label: "Set In Progress", icon: "🔵", activeStyle: "bg-indigo-50 text-indigo-900 border-indigo-300 ring-2 ring-indigo-500/20 shadow-2xs font-bold" },
                    { id: "RESOLVED", label: "Set Resolved", icon: "🟢", activeStyle: "bg-emerald-50 text-emerald-900 border-emerald-300 ring-2 ring-emerald-500/20 shadow-2xs font-bold" },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      disabled={isUpdatingStatus || selectedRequest.status === st.id}
                      onClick={() => handleStatusChange(selectedRequest.id, st.id)}
                      className={`text-xs h-10 px-3 rounded-xl border transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed ${
                        selectedRequest.status === st.id
                          ? st.activeStyle
                          : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      <span className="text-xs">{st.icon}</span>
                      <span>{st.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Original Message Bubble */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Request Message
                </label>
                <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4.5 text-xs font-medium text-slate-800 whitespace-pre-wrap leading-relaxed shadow-2xs">
                  {selectedRequest.message}
                </div>
              </div>

              {/* Existing Reply Display */}
              {selectedRequest.adminReply && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      Current Reply / Response
                    </label>
                    {selectedRequest.repliedAt && (
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                        <Clock className="h-3 w-3 text-emerald-600" />
                        {formatDate(selectedRequest.repliedAt)}
                      </span>
                    )}
                  </div>
                  <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-4.5 text-xs font-medium text-emerald-950 whitespace-pre-wrap leading-relaxed shadow-2xs">
                    {selectedRequest.adminReply}
                  </div>
                </div>
              )}

              {/* Reply Form */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {selectedRequest.adminReply
                      ? "Update Response to Submitter"
                      : "Send Response to Submitter"}
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium truncate">
                    Dispatches notification email to <strong className="text-slate-600">{selectedRequest.user?.email}</strong>
                  </span>
                </div>

                <Textarea
                  placeholder="Type your response to the team member here..."
                  className="min-h-[130px] text-xs font-medium resize-none rounded-2xl border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-2xs leading-relaxed"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  maxLength={5000}
                />

                <div className="flex items-center justify-between pt-1">
                  <p className="text-[11px] text-slate-400 font-medium">
                    {replyText.length} / 5000 characters
                  </p>

                  <div className="flex items-center gap-2.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(null);
                        setReplyText("");
                      }}
                      className="h-10 px-5 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer shadow-2xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleReply}
                      disabled={isReplying || !replyText.trim()}
                      className="h-10 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-2 shadow-md shadow-indigo-500/20 cursor-pointer transition-all"
                    >
                      {isReplying ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Saving & Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          {selectedRequest.adminReply ? "Update Reply" : "Send Reply"}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
