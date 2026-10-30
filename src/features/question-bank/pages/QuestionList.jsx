"use client";

import { useState, useMemo, useRef } from "react";
import {
  HelpCircle,
  Plus,
  FolderTree,
  Search,
  Sparkles,
  ChevronDown,
  Filter,
  LayoutList,
  LayoutGrid,
  Trash2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/features/auth/context";

import {
  CategoryFilter,
  DifficultyFilter,
  StatusFilter,
  SortFilter,
  QuestionGrid,
  QuestionTableView,
  QuestionStats,
  AddQuestionDialog,
  BulkQuestionImportDialog,
  ManageCategoriesDialog,
  QuestionGridSkeleton,
  BulkDeleteDialog,
} from "../components";
import { useQuestions, useBulkDeleteQuestions } from "../hooks";

const QuestionList = () => {
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

  const [viewMode, setViewMode] = useState("table");
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isDeleteAllMode, setIsDeleteAllMode] = useState(false);

  const bulkDeleteMutation = useBulkDeleteQuestions();

  const {
    questions,
    allQuestions,
    isLoading,
    isError,
    error,
    refetch,
    search,
    setSearch,
    category,
    setCategory,
    difficulty,
    setDifficulty,
    status,
    setStatus,
    sortBy,
    setSortBy,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalQuestions,
  } = useQuestions();

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

  const startIndex = totalQuestions === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalQuestions);

  const hasFilters =
    search.trim() !== "" ||
    category !== "all" ||
    difficulty !== "all" ||
    status !== "all";

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllVisible = () => {
    const pageIds = (questions || []).map((q) => q.id).filter(Boolean);
    const allPageSelected =
      pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

    if (allPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleOpenDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    setIsDeleteAllMode(false);
    setIsBulkDeleteDialogOpen(true);
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
              ? "All questions deleted successfully!"
              : `${deletingCount} question(s) deleted successfully!`);
          toast.success(msg);
        },
        onError: (err) => {
          toast.error(
            err?.response?.data?.message || err?.message || "Failed to delete questions."
          );
        },
      }
    );
  };

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
              Question Bank
            </h1>

            {/* Subtitle */}
            <p className="text-white/85 text-xs sm:text-sm font-medium leading-relaxed max-w-2xl">
              Manage technical MCQ questions, skill categories, difficulty weightings, and assessment items
            </p>
          </div>

          {/* Engine Banner & Top Actions Row */}
          <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-2.5 px-4 flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 text-white shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-xl bg-white/20 border border-white/30 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <BookOpen className="h-4 w-4" />
              </div>
              <div className="text-xs min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-white shrink-0 text-xs">Question Engine:</span>
                  <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/40 text-[11px] py-0.5 px-2.5 flex items-center gap-1.5 font-semibold rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                    Multi-Skill Domain Shuffling Active
                  </Badge>
                </div>
              </div>
            </div>

            {/* Quick Actions in Hero */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap">
              <ManageCategoriesDialog />
              <BulkQuestionImportDialog />
              <AddQuestionDialog />
            </div>
          </div>
        </div>
      </div>

      {/* ── Layer 3: Foreground (Overlapping 4 Stat Cards & Content) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 md:-mt-24 relative z-20 space-y-6 pb-20">
        
        {/* ── 1. 4 KPI Stat Cards ── */}
        <QuestionStats questions={allQuestions} />

        {/* ── 2. Filters & Search Toolbar (Glassmorphic Card) ── */}
        <div className="rounded-3xl border border-white/90 bg-white/95 backdrop-blur-md p-4 sm:p-5 shadow-[0_12px_30px_rgba(79,70,229,0.06),0_2px_8px_rgba(0,0,0,0.02)] ring-1 ring-slate-900/5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="h-4 w-4 absolute left-4 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search questions by title, code snippet, or topic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full pl-10 pr-4 rounded-full border border-slate-200/90 bg-slate-50/50 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition"
            />
          </div>

          {/* Filter Dropdowns & View Switcher */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <CategoryFilter value={category} onChange={setCategory} />
            <DifficultyFilter value={difficulty} onChange={setDifficulty} />
            <StatusFilter value={status} onChange={setStatus} />
            <SortFilter value={sortBy} onChange={setSortBy} />

            {/* View Mode Toggle */}
            <div className="col-span-2 sm:col-span-1 flex items-center justify-center sm:justify-start rounded-full bg-slate-100/80 p-1 border border-slate-200/90 shrink-0 sm:ml-1">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white text-indigo-600 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="Table Row View"
              >
                <LayoutList className="h-3.5 w-3.5" />
                <span>Table</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white text-indigo-600 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Cards</span>
              </button>
            </div>

            {/* Delete All (Isolated Action) */}
            {(totalQuestions > 0 || allQuestions.length > 0) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleOpenDeleteAll}
                className="h-10 px-3.5 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-xs font-bold gap-1.5 cursor-pointer shadow-xs transition"
                title="Delete all questions in bank"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete All</span>
              </Button>
            )}
          </div>
        </div>

        {/* ── 2.5 Bulk Action Bar (When items selected) ── */}
        {selectedIds.length > 0 && (
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/90 p-3.5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-center gap-2.5 text-xs">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-[11px] shadow-xs">
                {selectedIds.length}
              </span>
              <span className="font-extrabold text-slate-800">
                {selectedIds.length} {selectedIds.length === 1 ? "question" : "questions"} selected
              </span>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer"
              >
                Deselect all
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleOpenDeleteSelected}
                className="h-8 px-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold gap-1.5 shadow-xs cursor-pointer transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Selected ({selectedIds.length})</span>
              </Button>
            </div>
          </div>
        )}

        {/* ── 3. Questions Container (Table or Grid) ── */}
        <div className="rounded-3xl border border-white/90 bg-white/95 backdrop-blur-md p-6 sm:p-7 shadow-[0_12px_30px_rgba(79,70,229,0.08),0_2px_8px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/5 space-y-4 font-sans transition-all duration-200">
          {isLoading ? (
            <QuestionGridSkeleton />
          ) : isError ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-10 text-center">
              <h3 className="font-bold text-destructive">Unable to load questions</h3>
              <p className="text-xs text-muted-foreground mt-1">{error?.message || "Failed to load questions from database."}</p>
              <Button variant="outline" size="sm" onClick={refetch} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : questions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs">
                <HelpCircle className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {hasFilters ? "No matching questions found" : "No questions in Question Bank yet"}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  {hasFilters
                    ? "Try adjusting your search keywords or filter criteria."
                    : "Create your first MCQ question or import question sets to use inside candidate assessments."}
                </p>
              </div>
              {!hasFilters && (
                <div className="pt-2 flex items-center justify-center gap-2.5">
                  <BulkQuestionImportDialog />
                  <AddQuestionDialog />
                </div>
              )}
            </div>
          ) : viewMode === "table" ? (
            <QuestionTableView
              questions={questions}
              currentPage={currentPage}
              pageSize={pageSize}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAllVisible}
              allSelected={questions.length > 0 && questions.every((q) => selectedIds.includes(q.id))}
              isIndeterminate={
                questions.some((q) => selectedIds.includes(q.id)) &&
                !questions.every((q) => selectedIds.includes(q.id))
              }
            />
          ) : (
            <QuestionGrid
              questions={questions}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
            />
          )}

          {/* ── 4. Pagination Controls ── */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-muted-foreground font-medium">
              <div className="flex items-center gap-3">
                <p className="text-xs text-slate-500 font-medium">
                  Showing <strong className="text-slate-800">{startIndex}–{endIndex}</strong> of{" "}
                  <strong className="text-slate-800">{totalQuestions}</strong> questions
                </p>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="text-slate-300">•</span>
                  <span>Per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="h-7 px-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-8 px-2.5 text-xs rounded-lg border-slate-200 text-slate-600 font-bold hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Prev</span>
                </Button>

                {/* Numeric Page Buttons */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-8 w-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        currentPage === pageNum
                          ? "bg-indigo-600 text-white shadow-xs shadow-indigo-500/20"
                          : "text-slate-600 hover:bg-slate-100 bg-white border border-slate-200"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 px-2.5 text-xs rounded-lg border-slate-200 text-slate-600 font-bold hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 5. Bulk / All Delete Confirmation Modal ── */}
      <BulkDeleteDialog
        open={isBulkDeleteDialogOpen}
        onOpenChange={setIsBulkDeleteDialogOpen}
        count={isDeleteAllMode ? (totalQuestions || allQuestions.length) : selectedIds.length}
        isAll={isDeleteAllMode}
        onConfirm={handleConfirmDelete}
        isPending={bulkDeleteMutation.isPending}
      />
    </div>
  );
};

export default QuestionList;
