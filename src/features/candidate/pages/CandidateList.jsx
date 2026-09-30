"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Search,
  Mail,
  FileText,
  Plus,
  ChevronDown,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
  Copy,
  RefreshCw,
  Loader2,
  Zap,
  CheckCircle2,
  Check,
  Minus,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/features/auth/context";
import useSocketStore from "@/store/useSocketStore";

import {
  AddCandidateDialog,
  AssignAssessmentDialog,
  CandidateBulkActions,
  CandidateExtractorDrawer,
  CandidateTable,
  CandidateStatsCards,
  EmailExtractorDialog,
} from "../components";
import {
  useCandidatesQuery,
  useMailboxStatus,
  useConnectGoogleMailbox,
  useSyncMailboxNow,
} from "../hooks";

const DEFAULT_PAGE_SIZE = 10;

const CandidateList = () => {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

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
    "";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [singleAssignCandidate, setSingleAssignCandidate] = useState(null);
  const [drawerCandidate, setDrawerCandidate] = useState(null);

  const {
    data: candidates = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useCandidatesQuery();

  const { socket } = useSocketStore();

  useEffect(() => {
    if (!socket) return;
    
    const handleRefresh = () => {
       refetch();
    };

    socket.on("CANDIDATES_REFRESH_REQUIRED", handleRefresh);

    return () => {
      socket.off("CANDIDATES_REFRESH_REQUIRED", handleRefresh);
    };
  }, [socket, refetch]);

  // Catch Google OAuth redirect parameters: ?mailbox=connected&email=...
  useEffect(() => {
    if (searchParams?.get("mailbox") === "connected") {
      const email = searchParams.get("email") || "Google Account";
      toast.success(`🟢 Google Mailbox (${email}) connected successfully! Auto-sync is active.`);
      refetch();
      if (typeof window !== "undefined") {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [searchParams, refetch]);

  const filteredCandidates = useMemo(() => {
    const query = search.trim().toLowerCase();

    return candidates.filter((candidate) => {
      const name = candidate.name?.toLowerCase() ?? "";
      const email = candidate.email?.toLowerCase() ?? "";
      const phone = candidate.phone?.toLowerCase() ?? "";
      const role = candidate.role?.toLowerCase() ?? "";
      const skills = Array.isArray(candidate.skills)
        ? candidate.skills.join(" ").toLowerCase()
        : "";

      const matchesSearch =
        !query ||
        name.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        role.includes(query) ||
        skills.includes(query);

      const candStatus = String(candidate.status || "").toUpperCase();
      const upperStatusFilter = String(statusFilter || "ALL").toUpperCase();

      let matchesStatus = upperStatusFilter === "ALL";
      if (!matchesStatus) {
        if (upperStatusFilter === "NEW") {
          matchesStatus =
            candStatus === "NEW" ||
            candStatus === "UNINVITED" ||
            candStatus === "NOT_STARTED" ||
            candStatus === "APPLICANT" ||
            !candStatus;
        } else if (upperStatusFilter === "INVITED") {
          matchesStatus =
            candStatus === "INVITED" ||
            candStatus === "SENT" ||
            candStatus.includes("INVIT");
        } else if (upperStatusFilter === "STARTED") {
          matchesStatus =
            candStatus === "STARTED" ||
            candStatus === "IN_PROGRESS" ||
            candStatus === "IN PROGRESS";
        } else if (upperStatusFilter === "COMPLETED") {
          matchesStatus =
            candStatus === "COMPLETED" ||
            candStatus === "SUBMITTED" ||
            candStatus === "FINISHED";
        } else if (upperStatusFilter === "SHORTLISTED") {
          matchesStatus = candStatus === "SHORTLISTED";
        } else {
          matchesStatus =
            candStatus === upperStatusFilter ||
            candStatus.includes(upperStatusFilter);
        }
      }

      const candSource = String(candidate.source || "MANUAL").toUpperCase();
      const upperSourceFilter = String(sourceFilter || "ALL").toUpperCase();
      const matchesSource =
        upperSourceFilter === "ALL" ||
        candSource === upperSourceFilter ||
        candSource.includes(upperSourceFilter);

      return matchesSearch && matchesStatus && matchesSource;
    });
  }, [candidates, search, statusFilter, sourceFilter]);

  const effectivePageSize = pageSize === "all" ? Math.max(1, filteredCandidates.length) : Number(pageSize);
  const totalPages = Math.max(1, Math.ceil(filteredCandidates.length / effectivePageSize));
  const validPage = Math.min(currentPage, totalPages);

  const paginatedCandidates = useMemo(() => {
    if (pageSize === "all") return filteredCandidates;
    const startIndex = (validPage - 1) * effectivePageSize;
    return filteredCandidates.slice(startIndex, startIndex + effectivePageSize);
  }, [filteredCandidates, validPage, pageSize, effectivePageSize]);

  // Candidate ID sets for smart bulk selection
  const pageCandidateIds = useMemo(
    () => paginatedCandidates.map((c) => c.id),
    [paginatedCandidates]
  );
  const filteredCandidateIds = useMemo(
    () => filteredCandidates.map((c) => c.id),
    [filteredCandidates]
  );

  const selectedOnPageCount = useMemo(
    () =>
      pageCandidateIds.filter((id) =>
        selectedIds.some((sId) => String(sId) === String(id))
      ).length,
    [pageCandidateIds, selectedIds]
  );
  const isAllOnPageSelected =
    pageCandidateIds.length > 0 && selectedOnPageCount === pageCandidateIds.length;
  const isSomeOnPageSelected =
    selectedOnPageCount > 0 && !isAllOnPageSelected;

  const selectedFilteredCount = useMemo(
    () =>
      filteredCandidateIds.filter((id) =>
        selectedIds.some((sId) => String(sId) === String(id))
      ).length,
    [filteredCandidateIds, selectedIds]
  );
  const isAllFilteredSelected =
    filteredCandidateIds.length > 0 && selectedFilteredCount === filteredCandidateIds.length;

  const selectedCandidates = useMemo(() => {
    if (singleAssignCandidate) return [singleAssignCandidate];
    return candidates.filter((candidate) =>
      selectedIds.some((id) => String(id) === String(candidate.id))
    );
  }, [candidates, selectedIds, singleAssignCandidate]);

  const handleToggleCandidate = (candidateId) => {
    setSelectedIds((current) => {
      const isSelected = current.some((id) => String(id) === String(candidateId));
      if (isSelected) {
        return current.filter((id) => String(id) !== String(candidateId));
      }
      return [...current, candidateId];
    });
  };

  const handleToggleAll = () => {
    if (isAllOnPageSelected) {
      // Deselect all on current page
      setSelectedIds((current) =>
        current.filter(
          (selectedId) =>
            !pageCandidateIds.some((pId) => String(pId) === String(selectedId))
        )
      );
    } else {
      // Select all on current page
      setSelectedIds((current) => {
        const next = [...current];
        pageCandidateIds.forEach((cId) => {
          if (!next.some((id) => String(id) === String(cId))) {
            next.push(cId);
          }
        });
        return next;
      });
    }
  };

  const handleSelectAllFiltered = () => {
    setSelectedIds((current) => {
      const next = [...current];
      filteredCandidateIds.forEach((cId) => {
        if (!next.some((id) => String(id) === String(cId))) {
          next.push(cId);
        }
      });
      return next;
    });
  };

  const handleDeselectAllFiltered = () => {
    setSelectedIds((current) =>
      current.filter(
        (selectedId) =>
          !filteredCandidateIds.some((fId) => String(fId) === String(selectedId))
      )
    );
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
    setSingleAssignCandidate(null);
  };

  const handleSingleAssign = (candidate) => {
    setSingleAssignCandidate(candidate);
    setIsAssignDialogOpen(true);
  };

  const { data: mailboxStatus, refetch: refetchMailboxStatus } = useMailboxStatus();
  const connectGoogleMutation = useConnectGoogleMailbox();
  const syncMailboxMutation = useSyncMailboxNow();

  const inboundCareerEmail =
    mailboxStatus?.email ||
    user?.email ||
    user?.inboundEmail ||
    "";

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* ── 1. TOP ACTION TOOLBAR (Streamlined SaaS Layout) ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800">Candidate Pipeline</span>
          <span className="text-slate-300">•</span>
          <span className="text-xs text-slate-500 font-medium">
            {filteredCandidates.length} {filteredCandidates.length === 1 ? "candidate" : "candidates"} in directory
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <EmailExtractorDialog triggerText="Extract from Emails" />
          <AddCandidateDialog />
        </div>
      </div>

      {/* ── 1.5. INBOUND CAREERS MAILBOX CALLOUT ── */}
      <div className="rounded-2xl border border-indigo-100/90 bg-gradient-to-r from-indigo-50/90 via-purple-50/50 to-blue-50/80 p-3.5 px-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Mail className="h-4.5 w-4.5" />
          </div>
          <div className="text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-900">Recruiter Mailbox:</span>
              {mailboxStatus?.connected ? (
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs py-0.5 px-2.5 flex items-center gap-1.5 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {mailboxStatus?.email || user?.email || "Connected"}
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs py-0.5 px-2.5 flex items-center gap-1.5 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  Not Connected
                </Badge>
              )}
            </div>
            <p className="text-slate-500 text-[11px] mt-0.5 hidden sm:block">
              {mailboxStatus?.connected
                ? "Incoming candidate applications & resumes from this email are parsed into your directory."
                : "Connect your recruiter Google Mailbox to auto-sync resumes from LinkedIn, Indeed, and Naukri."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
          {mailboxStatus?.connected ? (
            <Button
              type="button"
              size="sm"
              onClick={() => syncMailboxMutation.mutate()}
              disabled={syncMailboxMutation.isPending}
              className="text-xs h-8 px-3 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs cursor-pointer"
            >
              {syncMailboxMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Sync Mailbox
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={() => connectGoogleMutation.mutate()}
              disabled={connectGoogleMutation.isPending}
              className="text-xs h-8 px-3 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs cursor-pointer"
            >
              {connectGoogleMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Mail className="h-3.5 w-3.5" />
              )}
              Connect Mailbox
            </Button>
          )}

          <button
            type="button"
            onClick={() => {
              const emailToCopy = mailboxStatus?.email || user?.email || "";
              if (emailToCopy) {
                navigator.clipboard.writeText(emailToCopy);
                toast.success(`Email copied: ${emailToCopy}`);
              }
            }}
            className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 hover:bg-white/90 bg-white/70 border border-indigo-200/80 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy Email
          </button>
        </div>
      </div>

      {/* ── 2. KPI Stat Cards ── */}
      <CandidateStatsCards candidates={candidates} />

      {/* ── 3. Filters & Search Toolbar ── */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or skill..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 w-full pl-9 pr-3 rounded-xl border border-slate-200/80 bg-slate-50/50 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs font-bold text-slate-600">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 px-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New Applicant</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="STARTED">Started</option>
              <option value="INVITED">Invited</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-600">Source:</span>
            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 px-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition cursor-pointer"
            >
              <option value="ALL">All Sources</option>
              <option value="EMAIL">Email Extraction</option>
              <option value="CSV">CSV Import</option>
              <option value="MANUAL">Manual</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── 3.5. Action Toolbar: Master Select & Per Page ── */}
      {filteredCandidates.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50/90 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center flex-wrap gap-2">
            {/* Master Page Checkbox Button */}
            <button
              type="button"
              onClick={handleToggleAll}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isAllOnPageSelected || isSomeOnPageSelected
                  ? "bg-blue-50 border-blue-300 text-blue-700 shadow-2xs"
                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100/60"
              }`}
            >
              <div
                className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                  isAllOnPageSelected || isSomeOnPageSelected
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "border-slate-300 bg-white"
                }`}
              >
                {isAllOnPageSelected && <Check className="h-3 w-3 stroke-[3]" />}
                {isSomeOnPageSelected && <Minus className="h-3 w-3 stroke-[3]" />}
              </div>
              <span>
                {isAllOnPageSelected
                  ? `Deselect Page (${pageCandidateIds.length})`
                  : `Select Page (${pageCandidateIds.length})`}
              </span>
            </button>

            {/* Select All Filtered Button */}
            {!isAllFilteredSelected && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAllFiltered}
                className="h-8 px-3 rounded-xl border-blue-200 bg-white text-blue-600 hover:text-blue-700 hover:bg-blue-50/70 text-xs font-bold cursor-pointer shadow-2xs"
              >
                <span>Select All {filteredCandidates.length} Candidates</span>
              </Button>
            )}

            {/* Clear All Selected */}
            {selectedIds.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
                className="h-8 px-2.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold gap-1 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
                <span>Clear Selection</span>
              </Button>
            )}
          </div>

          {/* Right: Selected Count & Page Size Dropdown */}
          <div className="flex items-center gap-3 self-end sm:self-center">
            <span className="text-xs font-semibold text-slate-600">
              <span className="font-extrabold text-blue-600">{selectedIds.length}</span> of {candidates.length} selected
            </span>

            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400">Rows:</span>
              <select
                value={String(pageSize)}
                onChange={(e) => {
                  const val = e.target.value;
                  setPageSize(val === "all" ? "all" : Number(val));
                  setCurrentPage(1);
                }}
                className="h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="all">All</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ── Smart Selection Banner (Gmail/HackerRank Style) ── */}
      {isAllOnPageSelected && filteredCandidates.length > pageCandidateIds.length && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/50 to-blue-50 border border-blue-200 text-xs text-blue-900 animate-in fade-in-50 shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
            <span>
              All <strong className="font-extrabold text-blue-950">{pageCandidateIds.length}</strong> candidates on this page are selected.
              {!isAllFilteredSelected ? (
                <button
                  type="button"
                  onClick={handleSelectAllFiltered}
                  className="ml-1.5 font-extrabold text-blue-600 underline underline-offset-2 hover:text-blue-900 cursor-pointer"
                >
                  Select all {filteredCandidates.length} candidates in this directory?
                </button>
              ) : (
                <span className="ml-1.5 font-bold text-emerald-700">
                  (All {filteredCandidates.length} candidates across all pages are currently selected)
                </span>
              )}
            </span>
          </div>

          {isAllFilteredSelected && (
            <button
              type="button"
              onClick={handleDeselectAllFiltered}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 underline cursor-pointer shrink-0"
            >
              Deselect All {filteredCandidates.length}
            </button>
          )}
        </div>
      )}

      {/* ── 4. Candidate Table ── */}
      <CandidateTable
        candidates={paginatedCandidates}
        selectedIds={selectedIds}
        onToggleCandidate={handleToggleCandidate}
        onToggleAll={handleToggleAll}
        onViewDetails={(candidate) => setDrawerCandidate(candidate)}
        onAssignAssessment={handleSingleAssign}
      />

      {/* ── 5. Pagination Footer ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground font-medium pt-2">
        <div className="flex items-center gap-3">
          <p>
            Showing{" "}
            <span className="font-bold text-slate-900">
              {filteredCandidates.length === 0 ? 0 : (validPage - 1) * effectivePageSize + 1}–
              {Math.min(validPage * effectivePageSize, filteredCandidates.length)}
            </span>{" "}
            of <span className="font-bold text-slate-900">{filteredCandidates.length}</span> Total Candidates
            {pageSize !== "all" && totalPages > 1 && (
              <span> (Page <span className="font-bold text-slate-900">{validPage} of {totalPages}</span>)</span>
            )}
          </p>

          <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
            <span className="text-[11px] font-semibold text-slate-400">Rows:</span>
            <select
              value={String(pageSize)}
              onChange={(e) => {
                const val = e.target.value;
                setPageSize(val === "all" ? "all" : Number(val));
                setCurrentPage(1);
              }}
              className="h-7 px-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>

        {pageSize !== "all" && totalPages > 1 && (
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
                        ? "bg-blue-600 text-white shadow-xs shadow-blue-500/20"
                        : "text-slate-600 hover:bg-slate-100 bg-white border border-slate-200"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

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
        )}
      </div>

      {/* ── 6. Modals & Drawers ── */}
      <CandidateBulkActions
        selectedCount={selectedIds.length}
        onAssignAssessment={() => setIsAssignDialogOpen(true)}
        onClearSelection={handleClearSelection}
      />

      <AssignAssessmentDialog
        open={isAssignDialogOpen}
        onOpenChange={(open) => {
          setIsAssignDialogOpen(open);
          if (!open) setSingleAssignCandidate(null);
        }}
        candidates={selectedCandidates}
        onSuccess={() => {
          handleClearSelection();
          refetch();
        }}
      />

      <CandidateExtractorDrawer
        candidate={drawerCandidate}
        open={Boolean(drawerCandidate)}
        onOpenChange={(open) => {
          if (!open) setDrawerCandidate(null);
        }}
        onAssignAssessment={(cand) => {
          setDrawerCandidate(null);
          handleSingleAssign(cand);
        }}
      />
    </div>
  );
};

export default CandidateList;
