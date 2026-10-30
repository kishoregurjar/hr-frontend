"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Search,
  Mail,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Check,
  Minus,
  X,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
  useStopAutomaticSync,
} from "../hooks";

const DEFAULT_PAGE_SIZE = 10;

const CandidateList = () => {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Scroll & 3D Parallax Refs
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

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [singleAssignCandidate, setSingleAssignCandidate] = useState(null);
  const [drawerCandidate, setDrawerCandidate] = useState(null);
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false);
  const [syncFromDate, setSyncFromDate] = useState("");
  const [syncToDate, setSyncToDate] = useState("");

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

  // ── 3D Parallax Scroll Handler ──
  const handleScroll = () => {
    const scrollY = scrollContainerRef.current?.scrollTop || 0;

    // 1. Far background decorative rings & ambient orbs inside the hero banner (slowest, 0.58x counter-lag)
    if (farBgRef.current) {
      const orbTranslate = scrollY * 0.58;
      const orbRotate = scrollY * 0.05;
      const orbScale = 1 + scrollY * 0.0003;
      farBgRef.current.style.transform = `translate3d(0, ${orbTranslate}px, 0) scale(${orbScale}) rotate(${orbRotate}deg)`;
    }

    // 2. Midground Hero Content: Title, subtitle, badge (0.42x counter-lag + 3D depth push)
    if (midHeroRef.current) {
      const heroProgress = Math.min(scrollY / 450, 1);
      const heroTranslate = scrollY * 0.42;
      const heroOpacity = Math.max(1 - heroProgress * 0.75, 0.2);
      const heroScale = 1 - heroProgress * 0.06;
      midHeroRef.current.style.transform = `translate3d(0, ${heroTranslate}px, 0) scale(${heroScale})`;
      midHeroRef.current.style.opacity = heroOpacity;
    }
  };

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
      setSelectedIds((current) =>
        current.filter(
          (selectedId) =>
            !pageCandidateIds.some((pId) => String(pId) === String(selectedId))
        )
      );
    } else {
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
  const stopAutomaticSyncMutation = useStopAutomaticSync();

  useEffect(() => {
    if (isSyncDialogOpen && mailboxStatus?.dateRangeSyncEnabled) {
      if (mailboxStatus.dateRangeSyncFrom) {
        setSyncFromDate(mailboxStatus.dateRangeSyncFrom.split("T")[0]);
      }
      if (mailboxStatus.dateRangeSyncTo) {
        setSyncToDate(mailboxStatus.dateRangeSyncTo.split("T")[0]);
      }
    }
  }, [isSyncDialogOpen, mailboxStatus?.dateRangeSyncEnabled, mailboxStatus?.dateRangeSyncFrom, mailboxStatus?.dateRangeSyncTo]);

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
              Candidates
            </h1>

            {/* Subtitle */}
            <p className="text-white/85 text-xs sm:text-sm font-medium leading-relaxed max-w-2xl">
              Manage candidate pipelines, email resume extraction, and assessment invitations
            </p>
          </div>

          {/* Recruiter Mailbox & Top Actions Row */}
          <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-2.5 px-4 flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 text-white shadow-xs">
            {/* Left: Compact Inbound Mailbox Status */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-xl bg-white/20 border border-white/30 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Mail className="h-4 w-4" />
              </div>
              <div className="text-xs min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-white shrink-0 text-xs">Recruiter Mailbox:</span>
                  {mailboxStatus?.connected ? (
                    <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/40 text-[11px] py-0.5 px-2.5 flex items-center gap-1.5 font-semibold max-w-[220px] truncate rounded-full">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                      <span className="truncate">{mailboxStatus?.email || user?.email || "Connected"}</span>
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-500/20 text-amber-200 border-amber-400/40 text-[11px] py-0.5 px-2.5 flex items-center gap-1.5 font-semibold rounded-full">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
                      Not Connected
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Actions (Sync Mailbox + Extract + Add Candidate) */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap">
              {mailboxStatus?.connected ? (
                <Dialog open={isSyncDialogOpen} onOpenChange={setIsSyncDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      size="sm"
                      disabled={syncMailboxMutation.isPending || mailboxStatus?.isSyncingNow}
                      className="text-xs h-8 px-3 gap-1.5 bg-white/15 hover:bg-white/25 text-white border border-white/30 font-semibold rounded-xl shadow-xs cursor-pointer disabled:opacity-50 transition-all"
                    >
                      {syncMailboxMutation.isPending || mailboxStatus?.isSyncingNow ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5" />
                      )}
                      {syncMailboxMutation.isPending || mailboxStatus?.isSyncingNow ? "Syncing..." : "Sync Mailbox"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Sync Mailbox</DialogTitle>
                      <DialogDescription>
                        {mailboxStatus?.dateRangeSyncEnabled
                          ? "An automatic future-date sync is currently active. You can adjust the sync date range or stop automatic sync anytime."
                          : "Select a date range to sync resumes received during that period. Leave dates empty to perform a standard backfill sync."}
                      </DialogDescription>
                    </DialogHeader>
                    
                    {mailboxStatus?.dateRangeSyncEnabled && (
                      <div className="pt-2 pb-1">
                        <div className="rounded-xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/90 to-teal-50/60 p-3.5 shadow-2xs">
                          <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs mb-2">
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            Automatic Sync Active
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px] bg-white/80 rounded-lg p-2.5 border border-emerald-100/80">
                            <div>
                              <span className="text-slate-500 font-medium">From:</span>{" "}
                              <span className="font-bold text-slate-800">
                                {mailboxStatus.dateRangeSyncFrom
                                  ? new Date(mailboxStatus.dateRangeSyncFrom).toLocaleDateString(undefined, { timeZone: "UTC" })
                                  : "N/A"}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500 font-medium">Until:</span>{" "}
                              <span className="font-bold text-slate-800">
                                {mailboxStatus.dateRangeSyncTo
                                  ? new Date(mailboxStatus.dateRangeSyncTo).toLocaleDateString(undefined, { timeZone: "UTC" })
                                  : "N/A"}
                              </span>
                            </div>
                            {mailboxStatus.dateRangeLastSyncedAt && (
                              <div className="col-span-2 text-[10px] text-slate-500 pt-1.5 border-t border-emerald-100 flex items-center justify-between">
                                <span>Last checked:</span>
                                <span className="font-semibold text-slate-700">
                                  {new Date(mailboxStatus.dateRangeLastSyncedAt).toLocaleTimeString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-xs font-bold text-slate-800 mt-3 mb-0.5">Change Date Range</div>
                      </div>
                    )}

                    <div className="grid gap-3.5 py-2">
                      <div className="grid gap-1.5">
                        <label htmlFor="syncFromDate" className="text-xs font-bold text-slate-700">
                          From Date
                        </label>
                        <input
                          id="syncFromDate"
                          type="date"
                          value={syncFromDate}
                          onChange={(e) => setSyncFromDate(e.target.value)}
                          className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-2xs"
                        />
                      </div>

                      <div className="grid gap-1.5">
                        <div className="flex items-center justify-between">
                          <label htmlFor="syncToDate" className="text-xs font-bold text-slate-700">
                            To Date
                          </label>
                          <button
                            type="button"
                            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer transition"
                            onClick={() => setSyncToDate(new Date().toISOString().split("T")[0])}
                          >
                            Set to Today
                          </button>
                        </div>
                        <input
                          id="syncToDate"
                          type="date"
                          value={syncToDate}
                          onChange={(e) => setSyncToDate(e.target.value)}
                          className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-2xs"
                        />
                      </div>
                    </div>

                    <DialogFooter className="pt-2">
                      <div className="flex items-center justify-between w-full gap-2">
                        {mailboxStatus?.dateRangeSyncEnabled ? (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="text-xs h-9 font-semibold rounded-xl"
                            disabled={stopAutomaticSyncMutation.isPending}
                            onClick={() => {
                              stopAutomaticSyncMutation.mutate(null, {
                                onSuccess: () => setIsSyncDialogOpen(false),
                              });
                            }}
                          >
                            {stopAutomaticSyncMutation.isPending ? "Stopping..." : "Stop Auto-Sync"}
                          </Button>
                        ) : (
                          <div className="mr-auto"></div>
                        )}
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-xs h-9 font-semibold rounded-xl border-slate-200"
                            onClick={() => setIsSyncDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            className="text-xs h-9 font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
                            disabled={syncMailboxMutation.isPending}
                            onClick={() => {
                              setIsSyncDialogOpen(false);
                              const payload = {};
                              if (syncFromDate || syncToDate) {
                                payload.fromDate = syncFromDate;
                                payload.toDate = syncToDate;
                                try {
                                  payload.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                                } catch (_) {}
                              }
                              syncMailboxMutation.mutate(payload);
                            }}
                          >
                            {syncMailboxMutation.isPending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                            ) : null}
                            {mailboxStatus?.dateRangeSyncEnabled ? "Update Sync" : "Start Sync"}
                          </Button>
                        </div>
                      </div>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => connectGoogleMutation.mutate()}
                  disabled={connectGoogleMutation.isPending}
                  className="text-xs h-8 px-3 gap-1.5 bg-white text-indigo-700 hover:bg-slate-50 font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {connectGoogleMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Mail className="h-3.5 w-3.5" />
                  )}
                  Connect Mailbox
                </Button>
              )}

              {/* Separator */}
              <div className="h-5 w-[1px] bg-white/30 mx-0.5 hidden sm:block" />

              {/* Extract from Emails & Add Candidate */}
              <EmailExtractorDialog triggerText="Extract from Emails" />
              <AddCandidateDialog />
            </div>
          </div>
        </div>
      </div>

      {/* ── Layer 3: Foreground (1.0x Normal Speed - Overlapping 4 Stat Cards & Candidate Content) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 md:-mt-24 relative z-20 space-y-6 pb-20">
        
        {/* ── 1. 4 KPI Stat Cards ── */}
        <CandidateStatsCards candidates={candidates} />

        {/* ── 2. Filters & Search Toolbar (3D Glassmorphic Card) ── */}
        <div className="rounded-3xl border border-white/90 bg-white/95 backdrop-blur-md p-4 sm:p-5 shadow-[0_12px_30px_rgba(79,70,229,0.06),0_2px_8px_rgba(0,0,0,0.02)] ring-1 ring-slate-900/5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="h-4 w-4 absolute left-4 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or skill..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 w-full pl-10 pr-4 rounded-full border border-slate-200/90 bg-slate-50/50 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition"
            />
          </div>

          {/* Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="text-xs font-bold text-slate-600 shrink-0">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 px-3 rounded-full border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition cursor-pointer flex-1 sm:flex-initial"
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
                className="h-9 px-3 rounded-full border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition cursor-pointer"
              >
                <option value="ALL">All Sources</option>
                <option value="EMAIL">Email Extraction</option>
                <option value="CSV">CSV Import</option>
                <option value="MANUAL">Manual</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── 3. Action Toolbar: Master Select & Per Page ── */}
        {filteredCandidates.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/90 border border-slate-200/90 shadow-2xs">
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
                  className="h-8 px-3 rounded-xl border-indigo-200 bg-white text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/70 text-xs font-bold cursor-pointer shadow-2xs"
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
                <span className="font-extrabold text-indigo-600">{selectedIds.length}</span> of {candidates.length} selected
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
                  className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
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

        {/* ── Smart Selection Banner ── */}
        {isAllOnPageSelected && filteredCandidates.length > pageCandidateIds.length && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/50 to-blue-50 border border-blue-200 text-xs text-blue-900 animate-in fade-in-50 shadow-2xs">
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

        {/* ── 4. Candidate Table Card ── */}
        <div
          className="rounded-3xl border border-white/90 bg-white/95 backdrop-blur-md p-6 sm:p-7 shadow-[0_12px_30px_rgba(79,70,229,0.08),0_2px_8px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/5 space-y-4 font-sans transition-all duration-200"
        >
          <CandidateTable
            candidates={paginatedCandidates}
            selectedIds={selectedIds}
            onToggleCandidate={handleToggleCandidate}
            onToggleAll={handleToggleAll}
            onViewDetails={(candidate) => setDrawerCandidate(candidate)}
            onAssignAssessment={handleSingleAssign}
          />

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground font-medium pt-3 border-t border-slate-100">
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
                            ? "bg-indigo-600 text-white shadow-xs"
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
        </div>
      </div>

      {/* ── 5. Modals & Drawers ── */}
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
