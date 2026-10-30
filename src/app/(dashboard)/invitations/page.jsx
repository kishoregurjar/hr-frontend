"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import {
  Send,
  RefreshCw,
  Copy,
  Mail,
  Sparkles,
  FileText,
  Inbox,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/context";
import { useAssessmentsQuery } from "@/features/assessment/hooks";
import { useCandidatesQuery, useAssignmentsQuery } from "@/features/candidate/hooks";
import { AssignAssessmentDialog } from "@/features/candidate/components";

export default function InvitationsPage() {
  const { user } = useAuth();

  // Scroll & Parallax Refs
  const scrollContainerRef = useRef(null);
  const farBgRef = useRef(null);
  const midHeroRef = useRef(null);

  const rawName =
    (typeof user?.name === "string" ? user.name : "") ||
    (typeof user?.fullName === "string" ? user.fullName : "") ||
    "HR Manager";
  const userName = String(rawName).replace(/\s+user$/i, "").trim() || "HR Manager";
  const companyName =
    user?.companyName ||
    user?.company?.name ||
    user?.company ||
    (typeof window !== "undefined" ? localStorage.getItem("companyName") : null) ||
    "Facebook Company";

  const [assessmentFilter, setAssessmentFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [preselectedAssessmentId, setPreselectedAssessmentId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const targetAssessmentId = params.get("assessmentId");
      if (targetAssessmentId) {
        setPreselectedAssessmentId(targetAssessmentId);
        setIsAssignDialogOpen(true);
      }
    }
  }, []);

  const { data: assessments = [] } = useAssessmentsQuery();
  const { data: candidates = [] } = useCandidatesQuery();
  const { data: rawAssignments = [], refetch } = useAssignmentsQuery();

  // ── Parallax Scroll Handler ──
  const handleScroll = () => {
    const scrollY = scrollContainerRef.current?.scrollTop || 0;

    // 1. Far background: decorative rings & ambient orbs inside hero banner (0.58x counter-lag)
    if (farBgRef.current) {
      const orbTranslate = scrollY * 0.58;
      const orbRotate = scrollY * 0.05;
      const orbScale = 1 + scrollY * 0.0003;
      farBgRef.current.style.transform = `translate3d(0, ${orbTranslate}px, 0) scale(${orbScale}) rotate(${orbRotate}deg)`;
    }

    // 2. Midground Hero Content: Title, subtitle, badge (0.42x counter-lag)
    if (midHeroRef.current) {
      const heroProgress = Math.min(scrollY / 450, 1);
      const heroTranslate = scrollY * 0.42;
      const heroOpacity = Math.max(1 - heroProgress * 0.75, 0.2);
      const heroScale = 1 - heroProgress * 0.06;
      midHeroRef.current.style.transform = `translate3d(0, ${heroTranslate}px, 0) scale(${heroScale})`;
      midHeroRef.current.style.opacity = heroOpacity;
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Invitation states refreshed!");
    }, 400);
  };

  const handleCopyLink = (token) => {
    const link = `${window.location.origin}/candidate/assessments/invitation?token=${token}`;
    navigator.clipboard.writeText(link);
    toast.success("Candidate exam link copied to clipboard!");
  };

  const dynamicInvitations = useMemo(() => {
    return (rawAssignments || []).map((assignment) => {
      const cand = candidates.find((c) => String(c.id) === String(assignment.candidateId)) || {};
      const assm = assessments.find((a) => String(a.id) === String(assignment.assessmentId)) || {};

      return {
        id: assignment.id,
        candidateName: assignment.candidateName || cand.name || "Candidate",
        email: assignment.candidateEmail || assignment.email || cand.email || "email@example.com",
        assessmentTitle: assignment.assessmentTitle || assm.title || "Assessment Test",
        status: assignment.status || "Sent",
        token: assignment.token || assignment.invitationToken || "token",
        dispatchedDate: assignment.invitedAt
          ? new Intl.DateTimeFormat("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
            }).format(new Date(assignment.invitedAt))
          : "Just now",
        expiresDate: assignment.expiresAt
          ? new Intl.DateTimeFormat("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
            }).format(new Date(assignment.expiresAt))
          : "7 Days",
      };
    });
  }, [rawAssignments, candidates, assessments]);

  const stats = useMemo(() => {
    const total = dynamicInvitations.length;
    const sent = dynamicInvitations.filter(
      (inv) => String(inv.status || "").toUpperCase() === "SENT" || !inv.status
    ).length;
    const inProgress = dynamicInvitations.filter((inv) => {
      const s = String(inv.status || "").toUpperCase();
      return s === "IN PROGRESS" || s === "STARTED" || s === "IN_PROGRESS";
    }).length;
    const completed = dynamicInvitations.filter(
      (inv) => String(inv.status || "").toUpperCase() === "COMPLETED"
    ).length;

    return { total, sent, inProgress, completed };
  }, [dynamicInvitations]);

  const filteredInvitations = useMemo(() => {
    if (assessmentFilter === "ALL") return dynamicInvitations;
    return dynamicInvitations.filter((inv) =>
      inv.assessmentTitle.toLowerCase().includes(assessmentFilter.toLowerCase())
    );
  }, [dynamicInvitations, assessmentFilter]);

  // Reset pagination to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [assessmentFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredInvitations.length / pageSize));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const startIndex = filteredInvitations.length === 0 ? 0 : (validPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredInvitations.length);

  const paginatedInvitations = useMemo(() => {
    return filteredInvitations.slice(startIndex, startIndex + pageSize);
  }, [filteredInvitations, startIndex, pageSize]);

  // Generate smart pagination numbers
  const paginationPages = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pageSet = new Set([1, totalPages, validPage, validPage - 1, validPage + 1]);
    const sorted = Array.from(pageSet)
      .filter((p) => p >= 1 && p <= totalPages)
      .sort((a, b) => a - b);

    const result = [];
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
        result.push(`ellipsis-${i}`);
      }
      result.push(sorted[i]);
    }
    return result;
  }, [totalPages, validPage]);

  const getStatusBadge = (status) => {
    const s = String(status || "").toUpperCase();
    if (s === "IN PROGRESS" || s === "STARTED" || s === "IN_PROGRESS") {
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 border-amber-300 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full"
        >
          In Progress
        </Badge>
      );
    }
    if (s === "COMPLETED") {
      return (
        <Badge
          variant="outline"
          className="bg-emerald-50 text-emerald-700 border-emerald-300 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full"
        >
          Completed
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-blue-50 text-blue-700 border-blue-300 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full"
      >
        Sent
      </Badge>
    );
  };

  const cardBaseStyle =
    "rounded-3xl border border-white/90 bg-white/95 backdrop-blur-md p-5 sm:p-6 shadow-[0_12px_30px_rgba(79,70,229,0.08),0_2px_8px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/5 transition-all duration-200 hover:shadow-lg flex flex-col justify-between space-y-4 select-none";

  return (
    <div 
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="-m-4 md:-m-6 h-[calc(100dvh-64px)] max-h-[calc(100dvh-64px)] overflow-y-auto overflow-x-hidden relative bg-[#f8fafc] no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden font-sans"
    >
      {/* ── Layer 1 & 2: 3D Parallax Hero Header ── */}
      <div className="relative bg-gradient-to-r from-[#4E35E8] via-[#6D38F0] to-[#CF2E9F] text-white pt-10 pb-36 md:pb-40 px-6 md:px-12 overflow-hidden shadow-lg select-none">
        
        {/* Far Background: Rotating Ambient Orbs & Concentric Rings */}
        <div
          ref={farBgRef}
          className="absolute inset-0 pointer-events-none will-change-transform"
          style={{ transform: "translate3d(0, 0, 0)" }}
        >
          {/* Glowing Ambient Radial Glow */}
          <div className="absolute -top-28 -right-28 w-[450px] h-[450px] rounded-full bg-white/12 blur-3xl" />

          {/* Concentric 3D Rings */}
          <div className="absolute -top-16 -right-16 w-[380px] h-[380px] rounded-full border border-white/20" />
          <div className="absolute top-10 right-16 w-[260px] h-[260px] rounded-full border border-white/15" />
          <div className="absolute top-28 right-36 w-[140px] h-[140px] rounded-full border border-white/10" />

          {/* Floating Subtle Shimmer Sparks */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-white/40 blur-[1px] animate-pulse" />
          <div className="absolute top-1/3 left-2/3 w-2.5 h-2.5 rounded-full bg-pink-200/50 blur-[1px] animate-pulse" />
        </div>

        {/* Midground: Hero Content (0.42x Parallax Speed) */}
        <div
          ref={midHeroRef}
          className="max-w-7xl mx-auto space-y-4 relative z-10 will-change-transform"
          style={{ transform: "translate3d(0, 0, 0)" }}
        >
          <div className="space-y-1">
            {/* Company Tag */}
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-white/75 drop-shadow-xs">
              {companyName}
            </p>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight drop-shadow-sm">
              Invitations
            </h1>

            {/* Subtitle */}
            <p className="text-white/85 text-xs sm:text-sm font-medium leading-relaxed max-w-2xl">
              Track candidate assessment dispatches, monitor test tokens, and supervise evaluation status in real time
            </p>
          </div>

          {/* Dispatch Engine Banner & Top Actions Row */}
          <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-2.5 px-4 flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 text-white shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-xl bg-white/20 border border-white/30 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Send className="h-4 w-4" />
              </div>
              <div className="text-xs min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-white shrink-0 text-xs">Dispatch Gateway:</span>
                  <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/40 text-[11px] py-0.5 px-2.5 flex items-center gap-1.5 font-semibold rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                    Tokenized Candidate Invites Active
                  </Badge>
                </div>
              </div>
            </div>

            {/* Quick Dispatch CTA */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                size="sm"
                onClick={() => setIsAssignDialogOpen(true)}
                className="text-xs h-8 px-3.5 gap-1.5 bg-white text-indigo-700 hover:bg-slate-50 font-bold rounded-xl shadow-xs cursor-pointer transition-all"
              >
                <Send className="h-3.5 w-3.5" />
                Dispatch Invitations
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Layer 3: Foreground (Overlapping 4 Stat Cards & Invitations Content) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 md:-mt-24 relative z-20 space-y-6 pb-20">
        
        {/* ── 1. 4 KPI Stat Cards ── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
          {/* Card 1: Total Invitations */}
          <div className={cardBaseStyle}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                TOTAL INVITATIONS
              </span>
              <div className="h-9 w-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                <Send className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-800 tracking-tight">
                {stats.total}
              </p>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Dispatched assessment links
              </p>
            </div>
          </div>

          {/* Card 2: Sent */}
          <div className={cardBaseStyle}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                INVITATIONS SENT
              </span>
              <div className="h-9 w-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
                <Mail className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-800 tracking-tight">
                {stats.sent}
              </p>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Awaiting candidate start
              </p>
            </div>
          </div>

          {/* Card 3: In Progress */}
          <div className={cardBaseStyle}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                TESTS IN PROGRESS
              </span>
              <div className="h-9 w-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-800 tracking-tight">
                {stats.inProgress}
              </p>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Currently taking evaluation
              </p>
            </div>
          </div>

          {/* Card 4: Completed */}
          <div className={cardBaseStyle}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                COMPLETED & SCORED
              </span>
              <div className="h-9 w-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-800 tracking-tight">
                {stats.completed}
              </p>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Finished & scored tests
              </p>
            </div>
          </div>
        </div>

        {/* ── 2. Filters & Actions Toolbar (Glassmorphic Card) ── */}
        <div className="rounded-3xl border border-white/90 bg-white/95 backdrop-blur-md p-4 sm:p-5 shadow-[0_12px_30px_rgba(79,70,229,0.06),0_2px_8px_rgba(0,0,0,0.02)] ring-1 ring-slate-900/5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Left: Filter by Assessment + Count */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="text-xs font-bold text-slate-600 shrink-0">Filter by Assessment:</span>
              <select
                value={assessmentFilter}
                onChange={(e) => setAssessmentFilter(e.target.value)}
                className="h-10 px-3.5 rounded-full border border-slate-200/90 bg-slate-50/50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer transition max-w-[280px] truncate"
              >
                <option value="ALL">All Assessments ({dynamicInvitations.length})</option>
                {assessments.map((a) => (
                  <option key={a.id} value={a.title}>
                    {a.title}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-slate-300 hidden sm:inline">•</span>

            <p className="text-xs text-slate-500 font-medium">
              Showing{" "}
              <span className="font-bold text-slate-900">
                {filteredInvitations.length === 0 ? 0 : startIndex + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-slate-900">{endIndex}</span> of{" "}
              <span className="font-bold text-slate-900">{filteredInvitations.length}</span> invitations
            </p>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5 self-end md:self-auto shrink-0">
            {/* Refresh Action */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-10 px-3.5 rounded-full border border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700 text-xs font-semibold gap-1.5 transition cursor-pointer shadow-xs"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${
                  isRefreshing ? "animate-spin text-indigo-600" : "text-slate-500"
                }`}
              />
              <span>Refresh</span>
            </Button>

            {/* Dispatch CTA */}
            <Button
              onClick={() => setIsAssignDialogOpen(true)}
              className="h-10 px-5 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs gap-1.5 shadow-md shadow-indigo-500/25 cursor-pointer transition"
            >
              <Send className="h-3.5 w-3.5" />
              Dispatch Invitations
            </Button>
          </div>
        </div>

        {/* ── 3. Invitations Table Card ── */}
        <div className="rounded-3xl border border-white/90 bg-white/95 backdrop-blur-md p-6 sm:p-7 shadow-[0_12px_30px_rgba(79,70,229,0.08),0_2px_8px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/5 space-y-4 font-sans transition-all duration-200">
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-5">Candidate</th>
                  <th className="py-3.5 px-5">Assessment</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Dispatched Date</th>
                  <th className="py-3.5 px-5">Expires</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                {filteredInvitations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-1">
                          <Inbox className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-bold text-slate-700">No invitations dispatched yet</p>
                        <p className="text-xs text-slate-400 max-w-sm">
                          Select candidates and dispatch tokenized assessment links to track their screening in real time.
                        </p>
                        <Button
                          onClick={() => setIsAssignDialogOpen(true)}
                          size="sm"
                          className="mt-2 h-9 px-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs"
                        >
                          <Send className="mr-1.5 h-3.5 w-3.5" />
                          Dispatch First Invitation
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedInvitations.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                      {/* Candidate */}
                      <td className="py-4 px-5">
                        <p className="font-bold text-slate-900 text-sm">
                          {inv.candidateName}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                          <Mail className="h-3 w-3 text-slate-400" />
                          <span>{inv.email}</span>
                        </div>
                      </td>

                      {/* Assessment */}
                      <td className="py-4 px-5 font-semibold text-slate-800">
                        {inv.assessmentTitle}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">{getStatusBadge(inv.status)}</td>

                      {/* Dispatched Date */}
                      <td className="py-4 px-5 text-slate-500 font-medium">
                        {inv.dispatchedDate}
                      </td>

                      {/* Expires */}
                      <td className="py-4 px-5 text-slate-500 font-medium">
                        {inv.expiresDate}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyLink(inv.token)}
                            className="h-8 px-2.5 text-xs font-semibold rounded-xl gap-1.5 border-slate-200 text-slate-700 bg-white hover:bg-slate-50 shadow-2xs cursor-pointer"
                          >
                            <Copy className="h-3.5 w-3.5 text-slate-500" />
                            Copy Link
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── 4. Pagination Controls ── */}
          {filteredInvitations.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-muted-foreground font-medium">
              <div className="flex items-center gap-2 text-xs">
                <span>
                  Showing <span className="font-bold text-slate-800">{startIndex + 1}</span> to{" "}
                  <span className="font-bold text-slate-800">{endIndex}</span> of{" "}
                  <span className="font-bold text-slate-800">{filteredInvitations.length}</span> invitations
                </span>
                <div className="hidden sm:flex items-center gap-1.5 ml-2 border-l border-slate-200 pl-3">
                  <span className="text-[11px] text-slate-400 font-medium">Rows per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="h-7 rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-semibold text-slate-700 shadow-2xs focus:border-indigo-500 focus:outline-hidden cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={validPage === 1}
                    className="h-8 px-2.5 rounded-lg border-slate-200 text-slate-600 text-xs font-semibold gap-1 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Prev</span>
                  </Button>

                  <div className="flex items-center gap-1">
                    {paginationPages.map((pageItem, idx) => {
                      if (typeof pageItem === "string" && pageItem.startsWith("ellipsis")) {
                        return (
                          <span key={pageItem || idx} className="px-1 text-slate-400 font-bold select-none">
                            ...
                          </span>
                        );
                      }

                      const pageNum = Number(pageItem);
                      const isActive = validPage === pageNum;

                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`h-8 min-w-[32px] px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? "bg-indigo-600 text-white shadow-xs shadow-indigo-500/20"
                              : "text-slate-600 hover:bg-slate-100 bg-white border border-slate-200"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={validPage === totalPages}
                    className="h-8 px-2.5 rounded-lg border-slate-200 text-slate-600 text-xs font-semibold gap-1 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── 5. Assign Assessment Dialog Modal ── */}
      <AssignAssessmentDialog
        open={isAssignDialogOpen}
        onOpenChange={(next) => {
          setIsAssignDialogOpen(next);
          if (!next) setPreselectedAssessmentId(null);
        }}
        candidates={candidates}
        preselectedAssessmentId={preselectedAssessmentId}
        onSuccess={() => {
          setIsAssignDialogOpen(false);
          setPreselectedAssessmentId(null);
          refetch();
        }}
      />
    </div>
  );
}
