"use client";

import { useMemo, useState, useRef } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  Loader2,
  Trash2,
  Layers,
  CheckCircle2,
  Clock,
  Archive,
  BookOpen,
  Sparkles,
  Gamepad2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/features/auth/context";

import { ASSESSMENT_STATUS } from "../constants";
import {
  AssessmentTableView,
  AssessmentDetailsDrawer,
  BulkDeleteAssessmentDialog,
} from "../components";
import {
  useAssessmentsQuery,
  useAssessmentStatusMutation,
  useBulkDeleteAssessments,
} from "../hooks";
import { getAssessmentById } from "@/lib/api/assessments";

const PAGE_SIZE = 8;

const AssessmentList = () => {
  const { user } = useAuth();

  // Scroll & Parallax Refs
  const scrollContainerRef = useRef(null);
  const farBgRef = useRef(null);
  const midHeroRef = useRef(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionAssessmentId, setActionAssessmentId] = useState(null);
  const [selectedDrawerAssessment, setSelectedDrawerAssessment] = useState(null);
  const [isDrawerLoading, setIsDrawerLoading] = useState(false);

  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isDeleteAllMode, setIsDeleteAllMode] = useState(false);

  const bulkDeleteMutation = useBulkDeleteAssessments();

  const companyName =
    user?.companyName ||
    user?.company?.name ||
    user?.company ||
    (typeof window !== "undefined" ? localStorage.getItem("companyName") : null) ||
    "Facebook Company";

  const {
    data: assessments = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useAssessmentsQuery();

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
      toast.success("Assessments list updated!");
    }, 400);
  };

  const statusMutation = useAssessmentStatusMutation();

  const updateStatus = (id, newStatus) => {
    setActionAssessmentId(id);
    statusMutation.mutate(
      { id, status: newStatus },
      { onSettled: () => setActionAssessmentId(null) }
    );
  };

  const handlePublish = (id) => updateStatus(id, ASSESSMENT_STATUS.PUBLISHED);
  const handleArchive = (id) => updateStatus(id, ASSESSMENT_STATUS.ARCHIVED);
  const handleRestore = (id) => updateStatus(id, ASSESSMENT_STATUS.PUBLISHED);

  const handleViewDetails = async (assessment) => {
    setSelectedDrawerAssessment(assessment);
    setIsDrawerLoading(true);
    try {
      const detailedAssessment = await getAssessmentById(assessment.id);
      if (detailedAssessment) {
        setSelectedDrawerAssessment(detailedAssessment);
      }
    } catch (e) {
      toast.error("Failed to load full assessment details.");
    } finally {
      setIsDrawerLoading(false);
    }
  };

  const filteredAssessments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return assessments.filter((assessment) => {
      const title = assessment.title?.toLowerCase() ?? "";
      const description = assessment.description?.toLowerCase() ?? "";
      const matchesQuery = !query || title.includes(query) || description.includes(query);

      const normStatus = String(assessment.status || "DRAFT").toUpperCase();
      let matchesStatus = true;
      if (statusFilter === "PUBLISHED") {
        matchesStatus = normStatus === "PUBLISHED" || normStatus === "ACTIVE";
      } else if (statusFilter === "DRAFT") {
        matchesStatus = normStatus === "DRAFT";
      } else if (statusFilter === "ARCHIVED") {
        matchesStatus = normStatus === "ARCHIVED";
      }

      return matchesQuery && matchesStatus;
    });
  }, [assessments, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAssessments.length / PAGE_SIZE));
  const validPage = Math.min(currentPage, totalPages);

  const paginatedAssessments = useMemo(() => {
    const startIndex = (validPage - 1) * PAGE_SIZE;
    return filteredAssessments.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredAssessments, validPage]);

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllVisible = () => {
    const pageIds = paginatedAssessments.map((a) => a.id).filter(Boolean);
    const allPageSelected =
      pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

    if (allPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleOpenDeleteAll = () => {
    setIsDeleteAllMode(true);
    setIsBulkDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    const deletingCount = selectedIds.length;
    const isAll = isDeleteAllMode;

    bulkDeleteMutation.mutate(
      { ids: selectedIds, all: isDeleteAllMode },
      {
        onSuccess: (res) => {
          setSelectedIds([]);
          setIsBulkDeleteDialogOpen(false);
          const msg =
            res?.message ||
            (isAll
              ? "All assessments permanently deleted!"
              : `${deletingCount} assessment(s) permanently deleted!`);
          toast.success(msg);
        },
        onError: (err) => {
          toast.error(
            err?.response?.data?.message || err?.message || "Failed to delete assessments."
          );
        },
      }
    );
  };

  const stats = useMemo(() => {
    const total = assessments.length;
    const published = assessments.filter(
      (a) =>
        String(a.status || "").toUpperCase() === "PUBLISHED" ||
        String(a.status || "").toUpperCase() === "ACTIVE"
    ).length;
    const draft = assessments.filter(
      (a) =>
        String(a.status || "").toUpperCase() === "DRAFT" ||
        !a.status
    ).length;
    const archived = assessments.filter(
      (a) => String(a.status || "").toUpperCase() === "ARCHIVED"
    ).length;

    return { total, published, draft, archived };
  }, [assessments]);

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
              Assessments
            </h1>

            {/* Subtitle */}
            <p className="text-white/85 text-xs sm:text-sm font-medium leading-relaxed max-w-2xl">
              Configure multi-module screening tests, question & game weights, and evaluate candidate performance
            </p>
          </div>

          {/* Assessment Engine Status & Quick Top Actions Row */}
          <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-2.5 px-4 flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 text-white shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-xl bg-white/20 border border-white/30 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Layers className="h-4 w-4" />
              </div>
              <div className="text-xs min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-white shrink-0 text-xs">Assessment Engine:</span>
                  <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/40 text-[11px] py-0.5 px-2.5 flex items-center gap-1.5 font-semibold rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                    Multi-Module Scoring Active
                  </Badge>
                </div>
              </div>
            </div>

            {/* Quick Build CTA */}
            <div className="flex items-center gap-2 shrink-0">
              <Link href="/assessments/create">
                <Button
                  type="button"
                  size="sm"
                  className="text-xs h-8 px-3.5 gap-1.5 bg-white text-indigo-700 hover:bg-slate-50 font-bold rounded-xl shadow-xs cursor-pointer transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Build Assessment
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Layer 3: Foreground (Overlapping 4 Stat Cards & Assessments Content) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 md:-mt-24 relative z-20 space-y-6 pb-20">
        
        {/* ── 1. 4 KPI Stat Cards ── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
          {/* Card 1: Total Assessments */}
          <div className={cardBaseStyle}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                TOTAL ASSESSMENTS
              </span>
              <div className="h-9 w-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                <BookOpen className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-800 tracking-tight">
                {stats.total}
              </p>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Configured screening tests
              </p>
            </div>
          </div>

          {/* Card 2: Published */}
          <div className={cardBaseStyle}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                PUBLISHED & ACTIVE
              </span>
              <div className="h-9 w-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-800 tracking-tight">
                {stats.published}
              </p>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Active & ready for candidates
              </p>
            </div>
          </div>

          {/* Card 3: Draft */}
          <div className={cardBaseStyle}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                DRAFT ASSESSMENTS
              </span>
              <div className="h-9 w-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-800 tracking-tight">
                {stats.draft}
              </p>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Incomplete or preparing
              </p>
            </div>
          </div>

          {/* Card 4: Archived */}
          <div className={cardBaseStyle}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                ARCHIVED TESTS
              </span>
              <div className="h-9 w-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
                <Archive className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-800 tracking-tight">
                {stats.archived}
              </p>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Archived from active test bank
              </p>
            </div>
          </div>
        </div>

        {/* ── 2. Filters & Actions Toolbar (Glassmorphic Card) ── */}
        <div className="rounded-3xl border border-white/90 bg-white/95 backdrop-blur-md p-4 sm:p-5 shadow-[0_12px_30px_rgba(79,70,229,0.06),0_2px_8px_rgba(0,0,0,0.02)] ring-1 ring-slate-900/5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="h-4 w-4 absolute left-4 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by assessment title..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 w-full pl-10 pr-4 rounded-full border border-slate-200/90 bg-slate-50/50 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition"
            />
          </div>

          {/* Dropdown Filters & Action CTAs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="text-xs font-bold text-slate-600 shrink-0">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 px-3.5 rounded-full border border-slate-200/90 bg-slate-50/50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer transition w-full sm:w-auto"
              >
                <option value="ALL">All Statuses</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            {/* Refresh Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-10 px-3.5 rounded-full border border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700 text-xs font-semibold gap-1.5 transition cursor-pointer shadow-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-indigo-600" : "text-slate-500"}`} />
              Refresh
            </Button>

            {/* Delete All Button (when assessments exist) */}
            {assessments.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleOpenDeleteAll}
                className="h-10 px-3.5 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-xs font-bold gap-1.5 cursor-pointer shadow-xs transition"
                title="Permanently delete all assessments"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete All</span>
              </Button>
            )}

            {/* Build Assessment CTA */}
            <Link href="/assessments/create">
              <Button className="h-10 px-5 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs gap-1.5 shadow-md shadow-indigo-500/25 cursor-pointer transition">
                <Plus className="h-4 w-4" />
                Build Assessment
              </Button>
            </Link>
          </div>
        </div>

        {/* ── 3. Assessments Table Card ── */}
        <div className="rounded-3xl border border-white/90 bg-white/95 backdrop-blur-md p-6 sm:p-7 shadow-[0_12px_30px_rgba(79,70,229,0.08),0_2px_8px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/5 space-y-4 font-sans transition-all duration-200">
          {isLoading ? (
            <div className="space-y-3 py-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-16 rounded-2xl bg-slate-100/70 animate-pulse border border-slate-200/60"
                />
              ))}
            </div>
          ) : filteredAssessments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center bg-slate-50/50">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No assessments found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                {search || statusFilter !== "ALL"
                  ? "Try adjusting your search query or status filter."
                  : "Click '+ Build Assessment' above to design your first screening evaluation."}
              </p>
            </div>
          ) : (
            <AssessmentTableView
              assessments={paginatedAssessments}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onSelectAllVisible={handleSelectAllVisible}
              onViewDetails={handleViewDetails}
              onPublish={handlePublish}
              onArchive={handleArchive}
              onRestore={handleRestore}
              isPendingId={actionAssessmentId}
            />
          )}

          {/* ── 4. Pagination Footer ── */}
          {!isLoading && filteredAssessments.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground font-medium pt-3 border-t border-slate-100">
              <p>
                Showing{" "}
                <span className="font-bold text-slate-900">
                  {(validPage - 1) * PAGE_SIZE + 1}–
                  {Math.min(validPage * PAGE_SIZE, filteredAssessments.length)}
                </span>{" "}
                of <span className="font-bold text-slate-900">{filteredAssessments.length}</span> Total Assessments (Page{" "}
                <span className="font-bold text-slate-900">{validPage} of {totalPages}</span>)
              </p>

              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={validPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="h-8 px-2.5 rounded-lg border-slate-200 text-slate-600 text-xs font-semibold gap-1 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Prev</span>
                </Button>

                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                      const isCurrent = pageNum === validPage;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`h-8 min-w-[32px] px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isCurrent
                              ? "bg-indigo-600 text-white shadow-xs shadow-indigo-500/20"
                              : "text-slate-600 hover:bg-slate-100 bg-white border border-slate-200"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                )}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={validPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="h-8 px-2.5 rounded-lg border-slate-200 text-slate-600 text-xs font-semibold gap-1 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 5. Assessment Details Drawer ── */}
      <AssessmentDetailsDrawer
        open={Boolean(selectedDrawerAssessment)}
        onOpenChange={(open) => !open && setSelectedDrawerAssessment(null)}
        assessment={selectedDrawerAssessment}
        isLoading={isDrawerLoading}
      />

      {/* ── 6. Floating Bulk Selection Action Bar ── */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-800 animate-in fade-in slide-in-from-bottom-4">
          <span className="text-xs font-bold">
            {selectedIds.length} assessment{selectedIds.length > 1 ? "s" : ""} selected
          </span>
          <div className="h-4 w-px bg-slate-700" />
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              setIsDeleteAllMode(false);
              setIsBulkDeleteDialogOpen(true);
            }}
            className="h-7 px-3 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white gap-1.5 cursor-pointer"
          >
            <Trash2 className="h-3 w-3" />
            Delete Selected
          </Button>
          <button
            type="button"
            onClick={() => setSelectedIds([])}
            className="text-xs text-slate-400 hover:text-white transition ml-1 cursor-pointer font-medium"
          >
            Cancel
          </button>
        </div>
      )}

      {/* ── 7. Bulk / All Delete Confirmation Modal ── */}
      <BulkDeleteAssessmentDialog
        open={isBulkDeleteDialogOpen}
        onOpenChange={setIsBulkDeleteDialogOpen}
        count={isDeleteAllMode ? assessments.length : selectedIds.length}
        isAll={isDeleteAllMode}
        onConfirm={handleConfirmDelete}
        isPending={bulkDeleteMutation.isPending}
      />
    </div>
  );
};

export default AssessmentList;
