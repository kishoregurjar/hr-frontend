"use client";

import { useMemo, useState } from "react";
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
  EmailExtractorDialog,
  ImportCandidatesDialog,
} from "../components";
import { useCandidatesQuery, useSyncEmails } from "../hooks";

const CandidateList = () => {
  const { user } = useAuth();
  const rawName = user?.name || user?.fullName || "Sarah Jenkins";
  const userName = rawName.replace(/\s+user$/i, "").trim() || "Sarah Jenkins";
  const companyName = user?.company || "TechCorp Solutions";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");
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

      const matchesStatus =
        statusFilter === "ALL" ||
        String(candidate.status || "").toUpperCase() === statusFilter;

      const matchesSource =
        sourceFilter === "ALL" ||
        String(candidate.source || "").toUpperCase().includes(sourceFilter);

      return matchesSearch && matchesStatus && matchesSource;
    });
  }, [candidates, search, statusFilter, sourceFilter]);

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
    const visibleIds = filteredCandidates.map((candidate) => candidate.id);
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* ── 1. SINGLE, CLEAN HEADER ── */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Candidate Directory
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold">
              {companyName}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Manage applicants, extract resumes from recruiter inboxes, and prepare invitations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Demo Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span>Demo Environment</span>
          </div>

          {/* Admin Chip */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-semibold shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span className="font-bold text-slate-900">{userName}</span>
            <span className="text-[10px] font-extrabold uppercase bg-blue-50 text-blue-700 border border-blue-200/70 px-1.5 py-0.5 rounded ml-0.5">
              HR
            </span>
          </div>

          {/* Actions */}
          <EmailExtractorDialog triggerText="Extract from Emails" />
          <ImportCandidatesDialog existingCandidates={candidates} />
          <AddCandidateDialog />
        </div>
      </div>

      {/* ── 3. Filters & Search Toolbar ── */}
      <div className="rounded-2xl border bg-card p-3 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="h-4 w-4 absolute left-3.5 top-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full pl-9 pr-3 rounded-xl border border-slate-200/80 bg-slate-50/50 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-bold text-slate-600">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-2.5 rounded-xl border bg-card text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="ALL">All Statuses</option>
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
              onChange={(e) => setSourceFilter(e.target.value)}
              className="h-9 px-2.5 rounded-xl border bg-card text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
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
        candidates={filteredCandidates}
        selectedIds={selectedIds}
        onToggleCandidate={handleToggleCandidate}
        onToggleAll={handleToggleAll}
        onViewDetails={(candidate) => setDrawerCandidate(candidate)}
        onAssignAssessment={handleSingleAssign}
      />

      {/* ── 5. Pagination Footer ── */}
      <div className="flex items-center justify-between text-xs text-muted-foreground font-medium pt-2">
        <p>
          Showing page <span className="font-bold text-slate-900">1 of 1</span> ({filteredCandidates.length} Total Candidates)
        </p>

        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" disabled>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" disabled>
            <ChevronRight className="h-4 w-4" />
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
      />
    </div>
  );
};

export default CandidateList;
