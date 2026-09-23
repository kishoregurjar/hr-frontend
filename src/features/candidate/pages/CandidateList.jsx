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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/features/auth/context";

import {
  AddCandidateDialog,
  AssignAssessmentDialog,
  CandidateBulkActions,
  CandidateExtractorDrawer,
  CandidateTable,
  CandidateStatsCards,
  EmailExtractorDialog,
  ImportCandidatesDialog,
} from "../components";
import {
  useCandidatesQuery,
  useMailboxStatus,
  useConnectGoogleMailbox,
  useSyncMailboxNow,
} from "../hooks";

const PAGE_SIZE = 10;

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

  const totalPages = Math.max(1, Math.ceil(filteredCandidates.length / PAGE_SIZE));
  const validPage = Math.min(currentPage, totalPages);

  const paginatedCandidates = useMemo(() => {
    const startIndex = (validPage - 1) * PAGE_SIZE;
    return filteredCandidates.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredCandidates, validPage]);

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
    const visibleIds = paginatedCandidates.map((candidate) => candidate.id);
    const areAllSelected =
      visibleIds.length > 0 &&
      visibleIds.every((candidateId) =>
        selectedIds.some((selectedId) => String(selectedId) === String(candidateId))
      );

    if (areAllSelected) {
      setSelectedIds((current) =>
        current.filter(
          (selectedId) =>
            !visibleIds.some((visibleId) => String(visibleId) === String(selectedId))
        )
      );
      return;
    }

    setSelectedIds((current) => {
      const next = [...current];
      visibleIds.forEach((candidateId) => {
        const exists = next.some((id) => String(id) === String(candidateId));
        if (!exists) {
          next.push(candidateId);
        }
      });
      return next;
    });
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
          <ImportCandidatesDialog existingCandidates={candidates} />
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
        <p>
          Showing{" "}
          <span className="font-bold text-slate-900">
            {filteredCandidates.length === 0 ? 0 : (validPage - 1) * PAGE_SIZE + 1}–
            {Math.min(validPage * PAGE_SIZE, filteredCandidates.length)}
          </span>{" "}
          of <span className="font-bold text-slate-900">{filteredCandidates.length}</span> Total Candidates (Page{" "}
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
                        ? "bg-blue-600 text-white shadow-xs shadow-blue-500/20"
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
