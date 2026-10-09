"use client";

import { useState, useMemo } from "react";
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
    meetingLink: "",
    customMessage: "We were impressed with your assessment performance and would love to invite you to our next technical interview round.",
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCandidateIds(filteredResults.map((r) => r.id));
    } else {
      setSelectedCandidateIds([]);
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
      const payload = {
        candidates: interviewTargets.map((c) => ({
          email: c.email || c.candidateEmail,
          name: c.candidateName || c.name,
          score: c.percentage || c.score || 0,
          assessmentTitle: c.assessmentTitle,
        })),
        roundName: interviewForm.roundName,
        scheduledAt: interviewForm.scheduledAt,
        meetingLink: interviewForm.meetingLink || "",
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
    toast.success("Rankings report exported as CSV!");
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
      {/* ── 1. TOP ACTION TOOLBAR ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge className="bg-amber-50 text-amber-700 border-amber-300 text-[10.5px] font-extrabold gap-1">
            <Trophy className="h-3 w-3 text-amber-600" />
            Live Leaderboard
          </Badge>
          <span className="text-slate-300">•</span>
          <span className="text-xs text-slate-500 font-medium">
            {filteredResults.length} scored {filteredResults.length === 1 ? "candidate" : "candidates"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="h-9 px-3 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold gap-1.5 shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing || isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={handleExportCSV}
            className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-1.5 shadow-sm shadow-blue-500/20 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* ── 2. EXACT DESIGN SYSTEM KPI STAT CARDS ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Card 1: Total Completed Tests */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs flex items-center justify-between transition hover:shadow-md">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Total Candidates
            </p>
            <h2 className="mt-1.5 text-3xl font-black text-slate-900 tracking-tight">
              {results.length}
            </h2>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100/90 text-slate-700">
            <Award className="h-5 w-5" />
          </div>
        </div>

        {/* Card 2: Mean Batch Score */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs flex items-center justify-between transition hover:shadow-md">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Average Score
            </p>
            <h2 className="mt-1.5 text-3xl font-black text-slate-900 tracking-tight">
              {results.length > 0
                ? Math.round(
                    results.reduce((acc, r) => acc + (r.percentage || 0), 0) / results.length
                  )
                : 0}%
            </h2>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100/90 text-slate-700">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* Card 3: Top Tier Shortlist */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs flex items-center justify-between transition hover:shadow-md">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Top Candidates
            </p>
            <h2 className="mt-1.5 text-3xl font-black text-slate-900 tracking-tight">
              {results.filter((r) => (r.percentage || 0) >= 85).length}
            </h2>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100/90 text-slate-700">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* ── 3. PODIUM HIGHLIGHT FOR TOP CANDIDATES (Dynamic Per-Assessment) ── */}
      {podiumCandidates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {podiumCandidates.map((candidate) => (
            <div
              key={candidate.id}
              onClick={() => setSelectedCandidate(candidate)}
              className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-white to-slate-50 p-5 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer space-y-3 relative overflow-hidden group"
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
                <h4 className="font-extrabold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                  {candidate.candidateName}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{candidate.email}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                <span className="truncate max-w-[200px]">{candidate.assessmentTitle}</span>
                <span className="text-blue-600 font-bold text-[11px] group-hover:underline flex items-center gap-1 shrink-0">
                  View Scorecard ➔
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 4. FILTER & SEARCH TOOLBAR ── */}
      <div className="rounded-2xl border bg-card p-3 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidate by name, email, or assessment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition shadow-2xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Assessment Filter */}
          <select
            value={selectedAssessment}
            onChange={(e) => {
              setSelectedAssessment(e.target.value);
              setSelectedCandidateIds([]);
            }}
            className="h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer max-w-[200px] truncate"
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
            className="h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
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
            className="h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
          >
            <option value="rank">Highest Score First</option>
            <option value="speed">Fastest Completion</option>
            <option value="name">Candidate Name (A-Z)</option>
          </select>

          {/* Interview Action Button - Only enabled when a specific assessment is selected */}
          {selectedAssessment !== "ALL" ? (
            selectedCandidateIds.length > 0 ? (
              <Button
                size="sm"
                onClick={openInterviewModalForSelected}
                className="h-10 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer transition animate-in fade-in"
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
          ) : (
            <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 bg-slate-100/80 border border-slate-200/80 px-3 py-2 rounded-xl">
              <Filter className="h-3 w-3 text-slate-400" />
              Select an assessment to enable checkboxes & interview invites
            </div>
          )}
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
                        filteredResults.length > 0 &&
                        selectedCandidateIds.length === filteredResults.length
                      }
                      onChange={handleSelectAll}
                      aria-label="Select all candidates"
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
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
                      <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs">
                        <Trophy className="h-7 w-7 text-blue-500" />
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
                filteredResults.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/70 transition group ${
                      selectedCandidateIds.includes(item.id) ? "bg-blue-50/40" : ""
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
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
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
                          className="h-8 px-3 rounded-xl border-slate-200 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-bold gap-1 shadow-2xs cursor-pointer transition"
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
      </div>

      {/* ── 6. DETAILED CANDIDATE SCORECARD MODAL ── */}
      {selectedCandidate && (
        <Dialog open={Boolean(selectedCandidate)} onOpenChange={() => setSelectedCandidate(null)}>
          <DialogContent className="max-w-xl p-7 sm:p-8 rounded-[28px] border-slate-100 shadow-2xl font-sans bg-white space-y-6">
            {/* Header: Candidate Info */}
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-2xl shadow-xs shrink-0">
                {selectedCandidate.candidateName.charAt(0).toLowerCase()}
              </div>
              <div className="space-y-0.5">
                <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
                  {selectedCandidate.candidateName}
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-500 font-medium">
                  {selectedCandidate.email} • {selectedCandidate.assessmentTitle}
                </DialogDescription>
              </div>
            </div>

            {/* Score Highlight Box */}
            <div className="grid grid-cols-4 gap-2 p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70 text-center">
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Rank</span>
                <p className="text-2xl font-black mt-1">
                  {selectedCandidate.status === "QUALIFIED" && selectedCandidate.assessmentRank ? (
                    <span className="text-amber-600">
                      #{selectedCandidate.assessmentRank}
                      {selectedCandidate.assessmentTotalCandidates > 1 && (
                        <span className="text-xs text-slate-400 font-normal"> / {selectedCandidate.assessmentTotalCandidates}</span>
                      )}
                    </span>
                  ) : (
                    <span className="text-slate-400">Unranked</span>
                  )}
                </p>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Total Score</span>
                <p className="text-2xl font-black text-slate-900 mt-1">{selectedCandidate.score}/100</p>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Time Taken</span>
                <p className="text-2xl font-black text-slate-900 mt-1">{selectedCandidate.timeSpent}</p>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Integrity</span>
                <p className="text-2xl font-black text-emerald-600 mt-1">{selectedCandidate.integrityScore}%</p>
              </div>
            </div>

            {/* Calibrated Cognitive Trait Performance */}
            <div className="space-y-4">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">
                Calibrated Cognitive Trait Performance
              </h4>

              <div className="grid grid-cols-3 gap-4 pt-1 text-center">
                {/* 1. Problem Solving */}
                {(() => {
                  const val = Math.min(100, Math.max(0, selectedCandidate.cognitiveTraits?.problemSolving ?? 0));
                  const r = 46;
                  const c = 2 * Math.PI * r;
                  const offset = c - (val / 100) * c;
                  return (
                    <div className="flex flex-col items-center">
                      <div className="relative w-28 h-28 flex items-center justify-center">
                        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 110 110">
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
                        <span className="absolute text-2xl font-black text-slate-900 tracking-tight">
                          {val}%
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 mt-3 max-w-[125px] leading-snug">
                        Problem Solving & Logical Reasoning
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
                      <div className="relative w-28 h-28 flex items-center justify-center">
                        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 110 110">
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
                        <span className="absolute text-2xl font-black text-slate-900 tracking-tight">
                          {val}%
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 mt-3 max-w-[125px] leading-snug">
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
                      <div className="relative w-28 h-28 flex items-center justify-center">
                        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 110 110">
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
                        <span className="absolute text-2xl font-black text-slate-900 tracking-tight">
                          {val}%
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 mt-3 max-w-[125px] leading-snug">
                        Mental Processing Agility
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Bottom: Close Button */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                className="h-11 px-7 rounded-full bg-slate-950 hover:bg-slate-900 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
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

            {/* Date & Time Picker */}
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

              {/* Meeting Link */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1 block">
                  Meeting Link (Google Meet / Zoom)
                </label>
                <div className="relative">
                  <Video className="h-3.5 w-3.5 absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type="url"
                    value={interviewForm.meetingLink}
                    onChange={(e) => setInterviewForm((prev) => ({ ...prev, meetingLink: e.target.value }))}
                    placeholder="https://meet.google.com/xyz or Zoom URL"
                    className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-2xs"
                  />
                </div>
              </div>
            </div>

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
                className="rounded-xl px-5 text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white gap-2 shadow-md shadow-blue-500/20 cursor-pointer"
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
