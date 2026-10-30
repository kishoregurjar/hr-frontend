"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Trophy,
  Search,
  Download,
  RefreshCw,
  Sparkles,
  Award,
  TrendingUp,
  Brain,
  CheckCircle2,
  XCircle,
  Eye,
  SlidersHorizontal,
  Zap,
  Clock,
  ShieldCheck,
  Building2,
  MapPin,
  Mail,
  User,
  Users,
  Send,
  Star,
  Inbox,
  Filter,
  Calendar,
  Video,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/context";
import { useAssessmentsQuery } from "@/features/assessment/hooks";
import { getAllResults, sendInterviewInvite } from "@/lib/api/results";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function ResultsAndRankingPage() {
  const { user } = useAuth();
  const rawName =
    (typeof user?.name === "string" ? user.name : "") ||
    (typeof user?.fullName === "string" ? user.fullName : "") ||
    "HR Manager";
  const userName = String(rawName).replace(/\s+user$/i, "").trim() || "HR Manager";

  const companyName =
    user?.companyName ||
    user?.company?.name ||
    (typeof user?.company === "string" ? user.company : null) ||
    "";

  const { data: apiAssessments = [] } = useAssessmentsQuery();

  const { data: dynamicResults = [], isLoading, refetch } = useQuery({
    queryKey: ["candidate-results"],
    queryFn: getAllResults,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const dynamicResultsList = useMemo(() => {
    return Array.isArray(dynamicResults) ? dynamicResults : [];
  }, [dynamicResults]);

  // Group results by assessment and calculate per-assessment rankings dynamically
  const rankedResults = useMemo(() => {
    if (!dynamicResultsList.length) return [];

    // Group items by assessment (by assessmentId or lowercased assessmentTitle)
    const groups = new Map();
    dynamicResultsList.forEach((item) => {
      const groupKey = String(
        item.assessmentId || item.assessment?.id || item.assessmentTitle || "default"
      ).trim().toLowerCase();
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey).push(item);
    });

    const enriched = [];

    // For each assessment, sort candidates by score descending and assign actual rank
    groups.forEach((groupItems) => {
      const qualifiedCount = groupItems.filter((i) => i.status === "QUALIFIED").length;

      const sortedGroup = [...groupItems].sort((a, b) => {
        // Qualified candidates come before FAILED / IN_REVIEW
        const isQualA = a.status === "QUALIFIED" ? 1 : 0;
        const isQualB = b.status === "QUALIFIED" ? 1 : 0;
        if (isQualB !== isQualA) return isQualB - isQualA;

        const scoreA = Number(a.score ?? a.percentage ?? 0);
        const scoreB = Number(b.score ?? b.percentage ?? 0);
        if (scoreB !== scoreA) return scoreB - scoreA;
        const percA = Number(a.percentage ?? 0);
        const percB = Number(b.percentage ?? 0);
        if (percB !== percA) return percB - percA;
        return String(a.timeSpent || "").localeCompare(String(b.timeSpent || ""));
      });

      let currentRank = 0;
      let previousScore = null;

      sortedGroup.forEach((item) => {
        // Only QUALIFIED candidates get a numerical leaderboard rank
        // FAILED candidates are unranked
        if (item.status === "FAILED") {
          enriched.push({
            ...item,
            assessmentRank: null,
            assessmentTotalCandidates: qualifiedCount,
          });
          return;
        }

        const itemScore = Number(item.score ?? item.percentage ?? 0);
        if (previousScore === null || itemScore !== previousScore) {
          currentRank += 1;
        }

        enriched.push({
          ...item,
          assessmentRank: currentRank,
          assessmentTotalCandidates: qualifiedCount,
        });

        previousScore = itemScore;
      });
    });

    return enriched;
  }, [dynamicResultsList]);

  const results = rankedResults;

  const availableAssessments = useMemo(() => {
    const titles = new Set();
    apiAssessments.forEach((a) => {
      if (a.title) titles.add(a.title);
    });
    rankedResults.forEach((r) => {
      if (r.assessmentTitle) titles.add(r.assessmentTitle);
    });
    return Array.from(titles);
  }, [apiAssessments, rankedResults]);

  const [search, setSearch] = useState("");
  const [selectedAssessment, setSelectedAssessment] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("rank");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Detailed Candidate Scorecard Modal
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Selected Candidates for Bulk / Interview Action
  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [interviewTargets, setInterviewTargets] = useState([]);
  const [isSendingInvites, setIsSendingInvites] = useState(false);

  // Form State for Interview Modal
  const [interviewForm, setInterviewForm] = useState({
    roundName: "Technical Interview - Round 2",
    scheduledAt: "",
    interviewMode: "OFFLINE",
    meetingLink: "",
    officeAddress: "",
    customMessage: "We were impressed with your assessment performance and would love to invite you to our next technical interview round.",
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const pageIds = paginatedResults.map((r) => r.id);
      setSelectedCandidateIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    } else {
      const pageIds = new Set(paginatedResults.map((r) => r.id));
      setSelectedCandidateIds((prev) => prev.filter((id) => !pageIds.has(id)));
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedCandidateIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const openInterviewModalForSelected = () => {
    const targets = filteredResults.filter((r) => selectedCandidateIds.includes(r.id));
    if (targets.length === 0) {
      toast.error("Please select at least one candidate.");
      return;
    }
    setInterviewTargets(targets);
    if (selectedAssessment && selectedAssessment !== "ALL") {
      setInterviewForm((prev) => ({
        ...prev,
        roundName: `${selectedAssessment} - Round 2 Interview`,
      }));
    }
    setIsInterviewModalOpen(true);
  };

  const openInterviewModalForSingle = (candidate) => {
    setInterviewTargets([candidate]);
    if (candidate?.assessmentTitle) {
      setInterviewForm((prev) => ({
        ...prev,
        roundName: `${candidate.assessmentTitle} - Round 2 Interview`,
      }));
    }
    setIsInterviewModalOpen(true);
  };

  const handleDispatchInterviewInvites = async () => {
    if (!interviewTargets.length) return;
    if (!interviewForm.scheduledAt) {
      toast.error("Please select the interview date and time.");
      return;
    }
    setIsSendingInvites(true);
    try {
      const isOnline =
        interviewForm.interviewMode === "ONLINE" ||
        Boolean(interviewForm.meetingLink && interviewForm.meetingLink.trim());

      const payload = {
        candidates: interviewTargets.map((c) => ({
          email: c.email || c.candidateEmail,
          name: c.candidateName || c.name,
          score: c.percentage || c.score || 0,
          assessmentTitle: c.assessmentTitle,
        })),
        roundName: interviewForm.roundName,
        scheduledAt: interviewForm.scheduledAt,
        interviewMode: isOnline ? "ONLINE" : "OFFLINE",
        meetingLink: isOnline ? (interviewForm.meetingLink || "").trim() : "",
        officeAddress: !isOnline ? (interviewForm.officeAddress || "").trim() : "",
        customMessage: interviewForm.customMessage || "",
        companyName: companyName || undefined,
      };

      const result = await sendInterviewInvite(payload);
      toast.success(
        `Interview invitation sent successfully to ${result?.count || interviewTargets.length} candidate(s)!`
      );
      await refetch();
      setIsInterviewModalOpen(false);
      setSelectedCandidateIds([]);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to send interview invitations.");
    } finally {
      setIsSendingInvites(false);
    }
  };

  const filteredResults = useMemo(() => {
    return rankedResults
      .filter((item) => {
        const matchesSearch =
          !search ||
          item.candidateName?.toLowerCase().includes(search.toLowerCase()) ||
          item.email?.toLowerCase().includes(search.toLowerCase()) ||
          item.assessmentTitle?.toLowerCase().includes(search.toLowerCase());

        const matchesAssessment =
          selectedAssessment === "ALL" ||
          item.assessmentTitle?.toLowerCase() === selectedAssessment.toLowerCase();

        const matchesStatus =
          statusFilter === "ALL" || item.status === statusFilter;

        return matchesSearch && matchesAssessment && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "rank") {
          // If a specific assessment is selected, strictly sort by assessmentRank (1, 2, 3...)
          // Unranked/Failed candidates (null rank) go to the bottom
          const rankA = a.assessmentRank !== null && a.assessmentRank !== undefined ? a.assessmentRank : 999999;
          const rankB = b.assessmentRank !== null && b.assessmentRank !== undefined ? b.assessmentRank : 999999;
          if (rankA !== rankB) return rankA - rankB;
          return (Number(b.score ?? b.percentage) || 0) - (Number(a.score ?? a.percentage) || 0);
        }
        if (sortBy === "score") {
          return (Number(b.score) || Number(b.percentage) || 0) - (Number(a.score) || Number(a.percentage) || 0);
        }
        if (sortBy === "speed") {
          return String(a.timeSpent || "").localeCompare(String(b.timeSpent || ""));
        }
        return String(a.candidateName || "").localeCompare(String(b.candidateName || ""));
      });
  }, [rankedResults, search, selectedAssessment, statusFilter, sortBy]);

  // Reset pagination to first page when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedAssessment, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredResults.length / pageSize));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const startIndex = filteredResults.length === 0 ? 0 : (validPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredResults.length);

  const paginatedResults = useMemo(() => {
    return filteredResults.slice(startIndex, startIndex + pageSize);
  }, [filteredResults, startIndex, pageSize]);

  // Helper for generating page numbers with smart ellipsis
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

  // Podium candidates: Only QUALIFIED candidates can appear on the podium (top 3)
  const podiumCandidates = useMemo(() => {
    const qualifiedOnly = filteredResults.filter(
      (r) => r.status === "QUALIFIED" && r.assessmentRank !== null && r.assessmentRank !== undefined
    );

    if (selectedAssessment !== "ALL") {
      return qualifiedOnly.slice(0, 3);
    }
    const leadersMap = new Map();
    rankedResults
      .filter((r) => r.status === "QUALIFIED" && r.assessmentRank !== null && r.assessmentRank !== undefined)
      .forEach((item) => {
        const key = String(item.assessmentId || item.assessmentTitle || "default").trim().toLowerCase();
        const existing = leadersMap.get(key);
        if (!existing) {
          leadersMap.set(key, item);
        } else {
          const currentScore = Number(item.score ?? item.percentage ?? 0);
          const existingScore = Number(existing.score ?? existing.percentage ?? 0);
          if (
            item.assessmentRank < existing.assessmentRank ||
            (item.assessmentRank === existing.assessmentRank && currentScore > existingScore)
          ) {
            leadersMap.set(key, item);
          }
        }
      });

    const topLeaders = Array.from(leadersMap.values()).sort(
      (a, b) => (Number(b.score ?? b.percentage) || 0) - (Number(a.score ?? a.percentage) || 0)
    );

    return topLeaders.slice(0, 3);
  }, [selectedAssessment, filteredResults, rankedResults]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    toast.success("Leaderboard results synchronized from PostgreSQL!");
  };

  const handleExportCSV = () => {
    if (filteredResults.length === 0) {
      toast.error("No candidate results to export yet.");
      return;
    }

    const headers = "Rank,Candidate Name,Email,Assessment,Score,Percentage,Status,Time Spent,Integrity\n";
    const rows = filteredResults
      .map(
        (r, i) =>
          `${r.assessmentRank ? `#${r.assessmentRank}` : "Unranked"},"${r.candidateName}","${r.email}","${r.assessmentTitle}",${r.score}/${r.maxScore},${r.percentage}%,${r.status},"${r.timeSpent}",${r.integrityScore}%`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `candidate_rankings_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast.success("Rankings report downloaded successfully!");
  };

  const getRankMedal = (rank, totalCandidates = 1, status = "") => {
    // FAILED or unranked candidates do NOT receive medals or ranks
    if (status === "FAILED" || rank === null || rank === undefined) {
      return (
        <div className="flex flex-col items-center justify-center">
          <span className="font-bold text-slate-400 text-sm leading-none">—</span>
          <span className="text-[9.5px] text-slate-400 font-semibold mt-0.5">Unranked</span>
        </div>
      );
    }

    const numRank = Number(rank) || 1;
    if (numRank === 1) {
      return (
        <div className="flex flex-col items-center justify-center">
          <span className="text-lg leading-none">🥇</span>
          <span className="text-[10px] font-black text-amber-600 mt-0.5">Rank #1</span>
          {totalCandidates > 1 && (
            <span className="text-[9px] text-slate-400 font-semibold">of {totalCandidates}</span>
          )}
        </div>
      );
    }
    if (numRank === 2) {
      return (
        <div className="flex flex-col items-center justify-center">
          <span className="text-lg leading-none">🥈</span>
          <span className="text-[10px] font-black text-slate-600 mt-0.5">Rank #2</span>
          {totalCandidates > 1 && (
            <span className="text-[9px] text-slate-400 font-semibold">of {totalCandidates}</span>
          )}
        </div>
      );
    }
    if (numRank === 3) {
      return (
        <div className="flex flex-col items-center justify-center">
          <span className="text-lg leading-none">🥉</span>
          <span className="text-[10px] font-black text-amber-800 mt-0.5">Rank #3</span>
          {totalCandidates > 1 && (
            <span className="text-[9px] text-slate-400 font-semibold">of {totalCandidates}</span>
          )}
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center">
        <span className="font-extrabold text-xs text-slate-600">#{numRank}</span>
        {totalCandidates > 1 && (
          <span className="text-[9px] text-slate-400 font-semibold">of {totalCandidates}</span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* ── 1. EXACT DESIGN SYSTEM KPI STAT CARDS ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Card 1: Total Completed Tests */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs flex items-center justify-between transition hover:shadow-md">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Total Candidates
            </p>
            <h2 className="mt-1.5 text-3xl font-bold text-slate-700 tracking-tight">
              {results.length}
            </h2>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
            <Award className="h-5 w-5" />
          </div>
        </div>

        {/* Card 2: Mean Batch Score */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs flex items-center justify-between transition hover:shadow-md">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Average Score
            </p>
            <h2 className="mt-1.5 text-3xl font-bold text-slate-700 tracking-tight">
              {results.length > 0
                ? Math.round(
                    results.reduce((acc, r) => acc + (r.percentage || 0), 0) / results.length
                  )
                : 0}%
            </h2>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* Card 3: Top Tier Shortlist */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs flex items-center justify-between transition hover:shadow-md">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Top Candidates
            </p>
            <h2 className="mt-1.5 text-3xl font-bold text-slate-700 tracking-tight">
              {results.filter((r) => (r.percentage || 0) >= 85).length}
            </h2>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 border border-amber-100 text-amber-600">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* ── 2. PODIUM HIGHLIGHT FOR TOP CANDIDATES (Dynamic Per-Assessment) ── */}
      {podiumCandidates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {podiumCandidates.map((candidate) => (
            <div
              key={candidate.id}
              onClick={() => setSelectedCandidate(candidate)}
              className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-white to-slate-50 p-5 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer space-y-3 relative overflow-hidden group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {candidate.assessmentRank === 1
                      ? "🥇"
                      : candidate.assessmentRank === 2
                      ? "🥈"
                      : candidate.assessmentRank === 3
                      ? "🥉"
                      : `#${candidate.assessmentRank}`}
                  </span>
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                      Rank #{candidate.assessmentRank || 1}
                    </span>
                    {candidate.assessmentTotalCandidates > 1 && (
                      <span className="text-[9.5px] text-slate-400 font-medium block">
                        of {candidate.assessmentTotalCandidates} candidates
                      </span>
                    )}
                  </div>
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px] font-black">
                  {candidate.percentage}% Score
                </Badge>
              </div>

              <div>
                <h4 className="font-extrabold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {candidate.candidateName}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{candidate.email}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                <span className="truncate max-w-[200px]">{candidate.assessmentTitle}</span>
                <span className="text-indigo-600 font-bold text-[11px] group-hover:underline flex items-center gap-1 shrink-0">
                  View Scorecard ➔
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 3. FILTER & SEARCH TOOLBAR ── */}
      <div className="rounded-2xl border bg-card p-3 shadow-xs flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidate by name, email, or assessment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition shadow-2xs"
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Assessment Filter */}
          <select
            value={selectedAssessment}
            onChange={(e) => {
              setSelectedAssessment(e.target.value);
              setSelectedCandidateIds([]);
            }}
            className="h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer max-w-[180px] truncate shadow-2xs"
          >
            <option value="ALL">All Assessments</option>
            {availableAssessments.map((title) => (
              <option key={title} value={title}>
                {title}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer shadow-2xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="FAILED">Failed</option>
          </select>

          {/* Sort Filter */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer shadow-2xs"
          >
            <option value="rank">Highest Score First</option>
            <option value="speed">Fastest Completion</option>
            <option value="name">Candidate Name (A-Z)</option>
          </select>

          {/* Interview Action Button - Only enabled when a specific assessment is selected */}
          {selectedAssessment !== "ALL" && (
            selectedCandidateIds.length > 0 ? (
              <Button
                size="sm"
                onClick={openInterviewModalForSelected}
                className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer transition animate-in fade-in"
              >
                <Calendar className="h-3.5 w-3.5" />
                Invite Selected ({selectedCandidateIds.length})
              </Button>
            ) : (
              filteredResults.some((r) => r.status === "QUALIFIED") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const qualified = filteredResults.filter((r) => r.status === "QUALIFIED");
                    setInterviewTargets(qualified);
                    setInterviewForm((prev) => ({
                      ...prev,
                      roundName: `${selectedAssessment} - Round 2 Interview`,
                    }));
                    setIsInterviewModalOpen(true);
                  }}
                  className="h-10 px-3.5 rounded-xl border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-800 text-xs font-bold gap-1.5 shadow-2xs cursor-pointer transition"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Invite All Qualified ({filteredResults.filter((r) => r.status === "QUALIFIED").length})
                </Button>
              )
            )
          )}

          {/* Divider */}
          <div className="h-6 w-[1px] bg-slate-200 mx-0.5 hidden sm:block" />

          {/* Refresh Action */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="h-10 px-3 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold gap-1.5 shadow-2xs cursor-pointer"
            title="Refresh Leaderboard"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing || isLoading ? "animate-spin text-indigo-600" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          {/* Download CTA */}
          <Button
            size="sm"
            onClick={handleExportCSV}
            className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs gap-1.5 shadow-sm shadow-indigo-500/20 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Download Report
          </Button>
        </div>
      </div>

      {/* ── 5. FULL RANKINGS DATA TABLE ── */}
      <div className="rounded-2xl border bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead className="bg-slate-50/80 border-b text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                {selectedAssessment !== "ALL" && (
                  <th className="py-3.5 px-4 w-10 text-center animate-in fade-in">
                    <input
                      type="checkbox"
                      checked={
                        paginatedResults.length > 0 &&
                        paginatedResults.every((item) => selectedCandidateIds.includes(item.id))
                      }
                      onChange={handleSelectAll}
                      aria-label="Select all candidates on this page"
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                    />
                  </th>
                )}
                <th className="py-3.5 px-4 w-14 text-center">Rank</th>
                <th className="py-3.5 px-5">Candidate</th>
                <th className="py-3.5 px-5">Assessment Module</th>
                <th className="py-3.5 px-5 text-center">Score & Pass %</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={selectedAssessment !== "ALL" ? 7 : 6} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
                      <div className="h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-2xs">
                        <Trophy className="h-7 w-7 text-indigo-600" />
                      </div>
                      <h3 className="font-extrabold text-base text-slate-900">
                        No Assessment Results Yet
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Candidate scores, rankings, and cognitive breakdowns will automatically appear here once tests are submitted.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedResults.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/70 transition group ${
                      selectedCandidateIds.includes(item.id) ? "bg-indigo-50/40" : ""
                    }`}
                  >
                    {/* Select Checkbox - only shown when specific assessment is selected */}
                    {selectedAssessment !== "ALL" && (
                      <td className="py-4 px-4 text-center animate-in fade-in">
                        <input
                          type="checkbox"
                          checked={selectedCandidateIds.includes(item.id)}
                          onChange={() => handleToggleSelect(item.id)}
                          aria-label={`Select ${item.candidateName}`}
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                        />
                      </td>
                    )}

                    {/* Rank */}
                    <td className="py-4 px-4 text-center font-extrabold">
                      {getRankMedal(item.assessmentRank, item.assessmentTotalCandidates, item.status)}
                    </td>

                    {/* Candidate */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                          {String(item.candidateName || "C")
                            .split(" ")
                            .filter(Boolean)
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 text-sm leading-tight">
                            {item.candidateName}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">{item.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Assessment */}
                    <td className="py-4 px-5">
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-800">{item.assessmentTitle}</p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.timeSpent} • {item.completedAt}
                        </p>
                      </div>
                    </td>

                    {/* Score */}
                    <td className="py-4 px-5 text-center">
                      <span className="font-black text-sm text-slate-900">
                        {item.score}/{item.maxScore || 100}
                      </span>
                      <span className="block text-[11px] font-bold text-emerald-600">
                        ({item.percentage}%)
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-5">
                      <div className="flex flex-col gap-1 items-start">
                        <Badge
                          className={`text-[10px] font-black uppercase px-2.5 py-0.5 ${
                            item.status === "QUALIFIED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                              : item.status === "IN_REVIEW"
                              ? "bg-amber-50 text-amber-700 border-amber-300"
                              : "bg-rose-50 text-rose-700 border-rose-300"
                          }`}
                        >
                          {item.status === "QUALIFIED" ? "Qualified" : item.status === "IN_REVIEW" ? "In Review" : "Failed"}
                        </Badge>

                        {item.status === "QUALIFIED" &&
                          item.interview &&
                          (!item.interview.assessmentTitle ||
                            item.assessmentTitle?.toLowerCase().includes(item.interview.assessmentTitle?.toLowerCase()) ||
                            item.interview.assessmentTitle?.toLowerCase().includes(item.assessmentTitle?.toLowerCase()) ||
                            item.interview.roundName?.toLowerCase().includes(item.assessmentTitle?.toLowerCase())) && (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/90 px-2 py-0.5 rounded-md shadow-2xs"
                              title={`Interview Scheduled: ${item.interview.formattedDate || item.interview.roundName}`}
                            >
                              <Calendar className="h-2.5 w-2.5 text-indigo-600" />
                              Interview Invited
                            </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.status === "QUALIFIED" && (() => {
                          const isCurrentAssessmentInvited =
                            Boolean(item.interview) &&
                            (!item.interview.assessmentTitle ||
                              item.assessmentTitle?.toLowerCase().includes(item.interview.assessmentTitle?.toLowerCase()) ||
                              item.interview.assessmentTitle?.toLowerCase().includes(item.assessmentTitle?.toLowerCase()) ||
                              item.interview.roundName?.toLowerCase().includes(item.assessmentTitle?.toLowerCase()));

                          return (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openInterviewModalForSingle(item)}
                              className={`h-8 px-2.5 rounded-xl text-xs font-bold gap-1 shadow-2xs cursor-pointer transition ${
                                isCurrentAssessmentInvited
                                  ? "border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 hover:text-indigo-800 text-indigo-700"
                                  : "border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 hover:text-emerald-800 text-emerald-700"
                              }`}
                              title={
                                isCurrentAssessmentInvited
                                  ? `Interview already scheduled for ${item.interview.formattedDate}`
                                  : "Schedule Next Round Interview"
                              }
                            >
                              <Calendar className="h-3.5 w-3.5" />
                              {isCurrentAssessmentInvited ? "Re-invite" : "Invite"}
                            </Button>
                          );
                        })()}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCandidate(item)}
                          className="h-8 px-3 rounded-xl border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-bold gap-1 shadow-2xs cursor-pointer transition"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Scorecard
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination Footer ── */}
        {filteredResults.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t text-xs text-muted-foreground bg-slate-50/40">
            <div className="flex items-center gap-2 text-xs">
              <span>
                Showing <span className="font-bold text-slate-800">{startIndex + 1}</span> to{" "}
                <span className="font-bold text-slate-800">{endIndex}</span> of{" "}
                <span className="font-bold text-slate-800">{filteredResults.length}</span> candidates
              </span>
              <div className="hidden sm:flex items-center gap-1.5 ml-2 border-l border-slate-200 pl-3">
                <span className="text-[11px] text-slate-400">Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="h-7 rounded-md border border-slate-200 bg-white px-1.5 text-[11px] font-semibold text-slate-700 shadow-2xs focus:border-blue-500 focus:outline-hidden"
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
                  className="h-8 px-2.5 text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-3.5 w-3.5 mr-0.5" />
                  Prev
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
                      <Button
                        key={pageNum}
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`h-8 w-8 p-0 text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={validPage === totalPages}
                  className="h-8 px-2.5 text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 6. DETAILED CANDIDATE SCORECARD MODAL ── */}
      {selectedCandidate && (
        <Dialog open={Boolean(selectedCandidate)} onOpenChange={() => setSelectedCandidate(null)}>
          <DialogContent className="max-w-2xl w-[94vw] sm:w-full p-4 sm:p-7 md:p-8 rounded-2xl sm:rounded-[28px] border-slate-100 shadow-2xl font-sans bg-white space-y-5 sm:space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header: Candidate Info */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl sm:text-2xl shadow-xs shrink-0">
                {selectedCandidate.candidateName.charAt(0).toLowerCase()}
              </div>
              <div className="space-y-0.5 min-w-0 flex-1">
                <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">
                  {selectedCandidate.candidateName}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-slate-500 font-medium truncate">
                  {selectedCandidate.email} • {selectedCandidate.assessmentTitle}
                </DialogDescription>
              </div>
            </div>

            {/* Score Highlight Box: 2 cols on mobile, 4 cols on tablet/desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-2 p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-50/70 border border-slate-200/70 text-center">
              <div className="p-1">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-400 tracking-wider">Rank</span>
                <p className="text-xl sm:text-2xl font-black mt-0.5 sm:mt-1">
                  {selectedCandidate.status === "QUALIFIED" && selectedCandidate.assessmentRank ? (
                    <span className="text-amber-600">
                      #{selectedCandidate.assessmentRank}
                      {selectedCandidate.assessmentTotalCandidates > 1 && (
                        <span className="text-[11px] sm:text-xs text-slate-400 font-normal"> / {selectedCandidate.assessmentTotalCandidates}</span>
                      )}
                    </span>
                  ) : (
                    <span className="text-slate-400">Unranked</span>
                  )}
                </p>
              </div>
              <div className="p-1">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-400 tracking-wider">Total Score</span>
                <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 sm:mt-1">{selectedCandidate.score}/100</p>
              </div>
              <div className="p-1">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-400 tracking-wider">Time Taken</span>
                <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 sm:mt-1">{selectedCandidate.timeSpent}</p>
              </div>
              <div className="p-1">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-400 tracking-wider">Integrity</span>
                <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5 sm:mt-1">{selectedCandidate.integrityScore}%</p>
              </div>
            </div>

            {/* Calibrated Cognitive Trait Performance */}
            <div className="space-y-3 sm:space-y-4">
              <h4 className="font-extrabold text-[11px] sm:text-xs uppercase tracking-wider text-slate-500">
                Calibrated Cognitive Trait Performance
              </h4>

              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-1 text-center">
                {/* 1. Problem Solving */}
                {(() => {
                  const val = Math.min(100, Math.max(0, selectedCandidate.cognitiveTraits?.problemSolving ?? 0));
                  const r = 46;
                  const c = 2 * Math.PI * r;
                  const offset = c - (val / 100) * c;
                  return (
                    <div className="flex flex-col items-center">
                      <div className="relative w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center">
                        <svg className="w-20 h-20 sm:w-28 sm:h-28 -rotate-90" viewBox="0 0 110 110">
                          <circle cx="55" cy="55" r={r} stroke="#e2e8f0" strokeWidth="10" fill="none" />
                          <circle
                            cx="55"
                            cy="55"
                            r={r}
                            stroke="#2563eb"
                            strokeWidth="10"
                            strokeDasharray={c}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            fill="none"
                            className="transition-all duration-700 ease-out"
                          />
                        </svg>
                        <span className="absolute text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                          {val}%
                        </span>
                      </div>
                      <p className="text-[10.5px] sm:text-xs font-bold text-slate-800 mt-2 sm:mt-3 max-w-[125px] leading-snug">
                        Problem Solving & Logic
                      </p>
                    </div>
                  );
                })()}

                {/* 2. Working Memory Recall */}
                {(() => {
                  const val = Math.min(100, Math.max(0, selectedCandidate.cognitiveTraits?.memoryRecall ?? 0));
                  const r = 46;
                  const c = 2 * Math.PI * r;
                  const offset = c - (val / 100) * c;
                  return (
                    <div className="flex flex-col items-center">
                      <div className="relative w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center">
                        <svg className="w-20 h-20 sm:w-28 sm:h-28 -rotate-90" viewBox="0 0 110 110">
                          <circle cx="55" cy="55" r={r} stroke="#e2e8f0" strokeWidth="10" fill="none" />
                          <circle
                            cx="55"
                            cy="55"
                            r={r}
                            stroke="#9333ea"
                            strokeWidth="10"
                            strokeDasharray={c}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            fill="none"
                            className="transition-all duration-700 ease-out"
                          />
                        </svg>
                        <span className="absolute text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                          {val}%
                        </span>
                      </div>
                      <p className="text-[10.5px] sm:text-xs font-bold text-slate-800 mt-2 sm:mt-3 max-w-[125px] leading-snug">
                        Working Memory Recall
                      </p>
                    </div>
                  );
                })()}

                {/* 3. Mental Processing Agility */}
                {(() => {
                  const val = Math.min(100, Math.max(0, selectedCandidate.cognitiveTraits?.processingSpeed ?? 0));
                  const r = 46;
                  const c = 2 * Math.PI * r;
                  const offset = c - (val / 100) * c;
                  return (
                    <div className="flex flex-col items-center">
                      <div className="relative w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center">
                        <svg className="w-20 h-20 sm:w-28 sm:h-28 -rotate-90" viewBox="0 0 110 110">
                          <circle cx="55" cy="55" r={r} stroke="#e2e8f0" strokeWidth="10" fill="none" />
                          <circle
                            cx="55"
                            cy="55"
                            r={r}
                            stroke="#059669"
                            strokeWidth="10"
                            strokeDasharray={c}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            fill="none"
                            className="transition-all duration-700 ease-out"
                          />
                        </svg>
                        <span className="absolute text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                          {val}%
                        </span>
                      </div>
                      <p className="text-[10.5px] sm:text-xs font-bold text-slate-800 mt-2 sm:mt-3 max-w-[125px] leading-snug">
                        Processing Agility
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Technical Quiz Performance Breakdown */}
            {selectedCandidate.quizBreakdown && (
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-[11px] sm:text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-blue-600" />
                    Technical Quiz Breakdown
                  </h4>
                  <span className="text-[11px] font-bold text-slate-500">
                    {selectedCandidate.quizBreakdown.total} Questions • {selectedCandidate.quizBreakdown.percentage}% Accuracy
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 sm:gap-3 text-center">
                  {/* Correct */}
                  <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Correct
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-emerald-700 mt-0.5 font-mono">
                      {selectedCandidate.quizBreakdown.correct}
                    </span>
                    <span className="text-[10px] text-emerald-600/80 font-medium">Full Marks</span>
                  </div>

                  {/* Incorrect */}
                  <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-100 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 flex items-center gap-1">
                      <XCircle className="h-3.5 w-3.5 text-rose-600" /> Incorrect
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-rose-700 mt-0.5 font-mono">
                      {selectedCandidate.quizBreakdown.incorrect}
                    </span>
                    <span className="text-[10px] text-rose-600/80 font-medium">Wrong Answers</span>
                  </div>

                  {/* Skipped */}
                  <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-600" /> Skipped
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-amber-700 mt-0.5 font-mono">
                      {selectedCandidate.quizBreakdown.skipped}
                    </span>
                    <span className="text-[10px] text-amber-600/80 font-medium">Unanswered</span>
                  </div>
                </div>
              </div>
            )}

            {/* Cognitive Games Performance & Accuracy Breakdown */}
            {Array.isArray(selectedCandidate.gamesBreakdown) && selectedCandidate.gamesBreakdown.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-[11px] sm:text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Gamepad2 className="h-3.5 w-3.5 text-indigo-600" />
                    Cognitive Games Performance & Accuracy
                  </h4>
                  <span className="text-[11px] font-bold text-slate-500">
                    {selectedCandidate.gamesBreakdown.length} Games Assessed
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedCandidate.gamesBreakdown.map((g) => (
                    <div
                      key={g.id}
                      className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between gap-2.5"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-black text-slate-900 truncate">
                            {g.title}
                          </p>
                          <Badge
                            className={`text-[8.5px] font-black uppercase px-1.5 py-0 ${
                              g.status === "Completed"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                : g.status === "Timed Out" || g.status === "Incomplete"
                                ? "bg-amber-100 text-amber-800 border-amber-200"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                          >
                            {g.status}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <span>{g.timeFormatted}</span>
                          <span>•</span>
                          <span>Score: {g.score}/100</span>
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider block">
                          Accuracy
                        </span>
                        <span className="text-sm font-black font-mono text-indigo-600">
                          {g.accuracy}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom: Close Button */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                className="w-full sm:w-auto h-10 sm:h-11 px-7 rounded-xl sm:rounded-full bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                Close Scorecard
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ── 7. NEXT ROUND INTERVIEW SCHEDULING MODAL ── */}
      <Dialog open={isInterviewModalOpen} onOpenChange={setIsInterviewModalOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden rounded-3xl border-slate-200 shadow-2xl font-sans bg-white">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 p-6 text-white relative">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center font-black text-lg shadow-inner">
                <Calendar className="h-6 w-6 text-blue-300" />
              </div>
              <div>
                <DialogTitle className="text-xl font-extrabold text-white tracking-tight">
                  Schedule Next Round Interview
                </DialogTitle>
                <DialogDescription className="text-xs text-blue-200/90 mt-0.5">
                  Send personalized email invitations with meeting link to {interviewTargets.length} selected candidate{interviewTargets.length > 1 ? "s" : ""}.
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Target Candidates Badges */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                Invited Candidate(s) ({interviewTargets.length})
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                {interviewTargets.map((c, i) => (
                  <span
                    key={c.id || i}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-2xs"
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    {c.candidateName || c.name}
                    <span className="text-[10px] text-slate-400">({c.percentage || c.score || 0}%)</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Round Name */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1 block">
                Interview Round Name *
              </label>
              <input
                type="text"
                value={interviewForm.roundName}
                onChange={(e) => setInterviewForm((prev) => ({ ...prev, roundName: e.target.value }))}
                placeholder="e.g. Technical Round 2 / System Design / HR Discussion"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-2xs"
              />
            </div>

            {/* Interview Mode Selector (Online vs Offline) */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 block">
                Interview Mode *
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100/90 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setInterviewForm((prev) => ({ ...prev, interviewMode: "OFFLINE" }))}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    interviewForm.interviewMode === "OFFLINE"
                      ? "bg-white text-emerald-800 shadow-sm border border-emerald-300/80"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Building2 className="h-4 w-4 text-emerald-600" />
                  <span>In-Person (Offline in Company)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInterviewForm((prev) => ({ ...prev, interviewMode: "ONLINE" }))}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    interviewForm.interviewMode === "ONLINE"
                      ? "bg-white text-blue-800 shadow-sm border border-blue-300/80"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Video className="h-4 w-4 text-blue-600" />
                  <span>Online (Google Meet / Zoom)</span>
                </button>
              </div>
            </div>

            {/* Date & Time and Mode Specific Input Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center justify-between">
                  <span>Date & Time *</span>
                  {!interviewForm.scheduledAt && (
                    <span className="text-[10px] text-amber-600 font-semibold">Required</span>
                  )}
                </label>
                <input
                  type="datetime-local"
                  required
                  min={new Date().toISOString().slice(0, 16)}
                  value={interviewForm.scheduledAt}
                  onChange={(e) => setInterviewForm((prev) => ({ ...prev, scheduledAt: e.target.value }))}
                  className={`w-full h-10 px-3.5 rounded-xl border text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 shadow-2xs ${
                    !interviewForm.scheduledAt
                      ? "border-amber-300 bg-amber-50/20 focus:ring-amber-500/30"
                      : "border-slate-200 focus:ring-blue-500/30"
                  }`}
                />
              </div>

              {interviewForm.interviewMode === "ONLINE" ? (
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center justify-between">
                    <span>Meeting Link *</span>
                    <span className="text-[10px] text-blue-600 font-bold">Google Meet / Zoom</span>
                  </label>
                  <div className="relative">
                    <Video className="h-3.5 w-3.5 absolute left-3 top-3.5 text-slate-400" />
                    <input
                      type="url"
                      value={interviewForm.meetingLink}
                      onChange={(e) => {
                        const val = e.target.value;
                        setInterviewForm((prev) => ({
                          ...prev,
                          meetingLink: val,
                          interviewMode: val.trim() ? "ONLINE" : prev.interviewMode,
                        }));
                      }}
                      placeholder="https://meet.google.com/xyz or Zoom URL"
                      className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-2xs"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center justify-between">
                    <span>Office Address / Venue</span>
                    <span className="text-[10px] text-emerald-600 font-bold">In-Person</span>
                  </label>
                  <div className="relative">
                    <MapPin className="h-3.5 w-3.5 absolute left-3 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={interviewForm.officeAddress}
                      onChange={(e) => setInterviewForm((prev) => ({ ...prev, officeAddress: e.target.value }))}
                      placeholder="e.g. 4th Floor, Tech Park, Office #402 (or leave blank for default)"
                      className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 shadow-2xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Visual Helper Banner */}
            {interviewForm.interviewMode === "ONLINE" ? (
              <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200/60 flex items-start gap-2 text-xs text-blue-900">
                <Video className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Online Virtual Interview:</strong> Candidate will receive video meeting link with instructions to join with webcam & microphone.
                </span>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/60 flex items-start gap-2 text-xs text-emerald-900">
                <Building2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>In-Person Offline Interview:</strong> Candidate email will clearly state this is an offline interview at your company office and remind them to bring resume & photo ID.
                </span>
              </div>
            )}

            {/* Custom Message */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1 block">
                Custom Message / Instructions to Candidates
              </label>
              <textarea
                rows={3}
                value={interviewForm.customMessage}
                onChange={(e) => setInterviewForm((prev) => ({ ...prev, customMessage: e.target.value }))}
                placeholder="Add instructions, pre-requisites, or congratulatory notes for the candidate..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none shadow-2xs"
              />
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsInterviewModalOpen(false)}
                className="rounded-xl px-4 text-xs font-bold text-slate-600 cursor-pointer"
              >
                Cancel
              </Button>

              <Button
                type="button"
                disabled={
                  isSendingInvites ||
                  !interviewTargets.length ||
                  !interviewForm.roundName.trim() ||
                  !interviewForm.scheduledAt
                }
                onClick={handleDispatchInterviewInvites}
                className="rounded-xl px-5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white gap-2 shadow-sm shadow-indigo-500/20 cursor-pointer"
              >
                {isSendingInvites ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Sending Invitations...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Send Invitation Email{interviewTargets.length > 1 ? "s" : ""}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
