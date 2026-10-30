"use client";

import { useState, useMemo, useEffect, useRef } from "react";
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
  X,
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
    (typeof user?.company === "string" ? user.company : null) ||
    (typeof window !== "undefined" ? localStorage.getItem("companyName") : null) ||
    "Facebook Company";

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

  const cardBaseStyle =
    "rounded-3xl border border-white/90 bg-white/95 backdrop-blur-md p-5 sm:p-6 shadow-[0_12px_30px_rgba(79,70,229,0.08),0_2px_8px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/5 transition-all duration-200 hover:shadow-lg flex flex-col justify-between space-y-4 select-none";

  const totalCandidatesCount = results.length;
  const qualifiedCount = results.filter((r) => r.status === "QUALIFIED").length;
  const averageScore =
    results.length > 0
      ? Math.round(results.reduce((acc, r) => acc + (r.percentage || 0), 0) / results.length)
      : 0;
  const topTierCount = results.filter((r) => (r.percentage || 0) >= 85).length;

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
              Results & Ranking
            </h1>

            {/* Subtitle */}
            <p className="text-white/85 text-xs sm:text-sm font-medium leading-relaxed max-w-2xl">
              Leaderboards, multi-module cognitive scoring, candidate rank percentiles, and interview scheduling
            </p>
          </div>

          {/* Leaderboard Engine Banner & Top Actions Row */}
          <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-2.5 px-4 flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 text-white shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-xl bg-white/20 border border-white/30 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Trophy className="h-4 w-4" />
              </div>
              <div className="text-xs min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-white shrink-0 text-xs">Leaderboard Engine:</span>
                  <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/40 text-[11px] py-0.5 px-2.5 flex items-center gap-1.5 font-semibold rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                    Live Scoring & Dynamic Calibration Active
                  </Badge>
                </div>
              </div>
            </div>

            {/* Quick Export CTA */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                size="sm"
                onClick={handleExportCSV}
                className="text-xs h-8 px-3.5 gap-1.5 bg-white text-indigo-700 hover:bg-slate-50 font-bold rounded-xl shadow-xs cursor-pointer transition-all"
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Layer 3: Foreground (Overlapping 4 Stat Cards & Results Content) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 md:-mt-24 relative z-20 space-y-6 pb-20">
        
        {/* ── 1. 4 KPI Stat Cards ── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
          {/* Card 1: Total Candidates */}
          <div className={cardBaseStyle}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                TOTAL CANDIDATES
              </span>
              <div className="h-9 w-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                <Award className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-800 tracking-tight">
                {totalCandidatesCount}
              </p>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Evaluated submissions
              </p>
            </div>
          </div>

          {/* Card 2: Qualified */}
          <div className={cardBaseStyle}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                QUALIFIED CANDIDATES
              </span>
              <div className="h-9 w-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-800 tracking-tight">
                {qualifiedCount}
              </p>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Passed passing criteria
              </p>
            </div>
          </div>

          {/* Card 3: Average Score */}
          <div className={cardBaseStyle}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                AVERAGE SCORE
              </span>
              <div className="h-9 w-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-800 tracking-tight">
                {averageScore}%
              </p>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Cohort mean performance
              </p>
            </div>
          </div>

          {/* Card 4: Top Tier (85%+) */}
          <div className={cardBaseStyle}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                TOP TIER (85%+)
              </span>
              <div className="h-9 w-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-800 tracking-tight">
                {topTierCount}
              </p>
              <p className="text-xs text-slate-400 font-medium mt-1">
                High potential talent
              </p>
            </div>
          </div>
        </div>

        {/* ── 2. Top 3 Podium Highlights (Dynamic Per-Assessment) ── */}
        {podiumCandidates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {podiumCandidates.map((candidate) => (
              <div
                key={candidate.id}
                onClick={() => setSelectedCandidate(candidate)}
                className="rounded-3xl border border-white/90 bg-white/95 backdrop-blur-md p-5 shadow-[0_12px_30px_rgba(79,70,229,0.06),0_2px_8px_rgba(0,0,0,0.02)] ring-1 ring-slate-900/5 hover:shadow-lg transition-all duration-200 cursor-pointer space-y-3 select-none group"
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
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px] font-black rounded-full px-2.5">
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

        {/* ── 3. Filters & Search Toolbar (Glassmorphic Card) ── */}
        <div className="rounded-3xl border border-white/90 bg-white/95 backdrop-blur-md p-4 sm:p-5 shadow-[0_12px_30px_rgba(79,70,229,0.06),0_2px_8px_rgba(0,0,0,0.02)] ring-1 ring-slate-900/5 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="h-4 w-4 absolute left-4 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate by name, email, or assessment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full pl-10 pr-4 rounded-full border border-slate-200/90 bg-slate-50/50 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition"
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
              className="h-10 px-3.5 rounded-full border border-slate-200/90 bg-slate-50/50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer max-w-[180px] truncate transition"
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
              className="h-10 px-3.5 rounded-full border border-slate-200/90 bg-slate-50/50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer transition"
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
              className="h-10 px-3.5 rounded-full border border-slate-200/90 bg-slate-50/50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer transition"
            >
              <option value="rank">Highest Score First</option>
              <option value="speed">Fastest Completion</option>
              <option value="name">Candidate Name (A-Z)</option>
            </select>

            {/* Interview Action Buttons */}
            {selectedAssessment !== "ALL" && (
              selectedCandidateIds.length > 0 ? (
                <Button
                  size="sm"
                  onClick={openInterviewModalForSelected}
                  className="h-10 px-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer transition animate-in fade-in"
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
                    className="h-10 px-3.5 rounded-full border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-800 text-xs font-bold gap-1.5 shadow-2xs cursor-pointer transition"
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
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="h-10 px-3.5 rounded-full border border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700 text-xs font-semibold gap-1.5 transition cursor-pointer shadow-xs"
              title="Refresh Leaderboard"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing || isLoading ? "animate-spin text-indigo-600" : "text-slate-500"}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            {/* Download Report Button */}
            <Button
              size="sm"
              onClick={handleExportCSV}
              className="h-10 px-5 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs gap-1.5 shadow-md shadow-indigo-500/25 cursor-pointer transition"
            >
              <Download className="h-3.5 w-3.5" />
              Download Report
            </Button>
          </div>
        </div>

        {/* ── 4. Full Rankings Data Table Card ── */}
        <div className="rounded-3xl border border-white/90 bg-white/95 backdrop-blur-md p-6 sm:p-7 shadow-[0_12px_30px_rgba(79,70,229,0.08),0_2px_8px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/5 space-y-4 font-sans transition-all duration-200">
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
            <table className="w-full text-left text-xs min-w-[760px]">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
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
                  paginatedResults.map((item) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/70 transition group ${
                        selectedCandidateIds.includes(item.id) ? "bg-indigo-50/40" : ""
                      }`}
                    >
                      {/* Select Checkbox */}
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
                            className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
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
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/90 px-2 py-0.5 rounded-full shadow-2xs"
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

          {/* ── 5. Pagination Footer ── */}
          {filteredResults.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-muted-foreground font-medium">
              <div className="flex items-center gap-2 text-xs">
                <span>
                  Showing <span className="font-bold text-slate-800">{startIndex + 1}</span> to{" "}
                  <span className="font-bold text-slate-800">{endIndex}</span> of{" "}
                  <span className="font-bold text-slate-800">{filteredResults.length}</span> candidates
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

      {/* ── 6. DETAILED CANDIDATE SCORECARD MODAL ── */}
      {selectedCandidate && (
        <Dialog open={Boolean(selectedCandidate)} onOpenChange={() => setSelectedCandidate(null)}>
          <DialogContent className="max-w-2xl w-[94vw] sm:w-full p-0 overflow-hidden rounded-3xl border border-white/90 shadow-2xl font-sans bg-white max-h-[92vh] flex flex-col">
            {/* Header: Signature Gradient Banner */}
            <div className="relative bg-gradient-to-r from-[#4E35E8] via-[#6D38F0] to-[#CF2E9F] text-white p-6 sm:p-7 overflow-hidden shrink-0 select-none">
              {/* Subtle Ambient Rings & Glow */}
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
              <div className="absolute top-2 right-12 w-28 h-28 rounded-full border border-white/15 pointer-events-none" />

              <div className="flex items-start justify-between gap-4 relative z-10">
                <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                  <div className="h-13 w-13 sm:h-14 sm:w-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center font-black text-xl sm:text-2xl shadow-inner shrink-0 uppercase">
                    {selectedCandidate.candidateName.charAt(0)}
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <DialogTitle className="text-xl sm:text-2xl font-black text-white tracking-tight truncate drop-shadow-xs">
                        {selectedCandidate.candidateName}
                      </DialogTitle>
                      {selectedCandidate.status === "QUALIFIED" ? (
                        <Badge className="bg-emerald-400/25 text-emerald-100 border-emerald-300/40 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Qualified
                        </Badge>
                      ) : (
                        <Badge className="bg-rose-400/25 text-rose-100 border-rose-300/40 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                          <XCircle className="h-3 w-3 mr-1" /> Not Qualified
                        </Badge>
                      )}
                    </div>
                    <DialogDescription className="text-xs sm:text-sm text-white/80 font-medium truncate">
                      {selectedCandidate.email} • {selectedCandidate.assessmentTitle}
                    </DialogDescription>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCandidate(null)}
                  className="h-8 w-8 rounded-xl bg-white/15 hover:bg-white/25 text-white/90 hover:text-white flex items-center justify-center shrink-0 transition-all cursor-pointer border border-white/20"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Content Body with smooth custom scrollbar */}
            <div className="p-6 sm:p-7 space-y-6 overflow-y-auto flex-1 no-scrollbar [scrollbar-width:none]">
              {/* Score Highlight KPI Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-100 shadow-2xs">
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                    Rank
                  </span>
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    {selectedCandidate.status === "QUALIFIED" && selectedCandidate.assessmentRank ? (
                      <>
                        <Trophy className="h-4 w-4 text-amber-500" />
                        <span className="text-xl sm:text-2xl font-black text-amber-600">
                          #{selectedCandidate.assessmentRank}
                        </span>
                        {selectedCandidate.assessmentTotalCandidates > 1 && (
                          <span className="text-[11px] text-slate-400 font-semibold">
                            /{selectedCandidate.assessmentTotalCandidates}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-xl sm:text-2xl font-black text-slate-400">Unranked</span>
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-100 shadow-2xs">
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                    Total Score
                  </span>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <span className="text-xl sm:text-2xl font-black text-indigo-600">
                      {selectedCandidate.score}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">/100</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-100 shadow-2xs">
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                    Time Taken
                  </span>
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-xl sm:text-2xl font-black text-slate-900">
                      {selectedCandidate.timeSpent}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-100 shadow-2xs">
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                    Integrity
                  </span>
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span className="text-xl sm:text-2xl font-black text-emerald-600">
                      {selectedCandidate.integrityScore}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Calibrated Cognitive Trait Performance */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-[11px] sm:text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Brain className="h-3.5 w-3.5 text-purple-600" />
                    Calibrated Cognitive Trait Performance
                  </h4>
                  <span className="text-[11px] font-bold text-slate-400">Standardized Scale</span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 sm:gap-4 p-4 rounded-3xl bg-slate-50/60 border border-slate-100 text-center">
                  {/* 1. Problem Solving */}
                  {(() => {
                    const val = Math.min(100, Math.max(0, selectedCandidate.cognitiveTraits?.problemSolving ?? 0));
                    const r = 46;
                    const c = 2 * Math.PI * r;
                    const offset = c - (val / 100) * c;
                    return (
                      <div className="flex flex-col items-center">
                        <div className="relative w-20 h-20 sm:w-26 sm:h-26 flex items-center justify-center">
                          <svg className="w-20 h-20 sm:w-26 sm:h-26 -rotate-90" viewBox="0 0 110 110">
                            <circle cx="55" cy="55" r={r} stroke="#e2e8f0" strokeWidth="9" fill="none" />
                            <circle
                              cx="55"
                              cy="55"
                              r={r}
                              stroke="#4F46E5"
                              strokeWidth="9"
                              strokeDasharray={c}
                              strokeDashoffset={offset}
                              strokeLinecap="round"
                              fill="none"
                              className="transition-all duration-700 ease-out"
                            />
                          </svg>
                          <span className="absolute text-base sm:text-xl font-black text-slate-900 tracking-tight">
                            {val}%
                          </span>
                        </div>
                        <p className="text-[10.5px] sm:text-xs font-bold text-slate-800 mt-2 sm:mt-2.5 max-w-[125px] leading-snug">
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
                        <div className="relative w-20 h-20 sm:w-26 sm:h-26 flex items-center justify-center">
                          <svg className="w-20 h-20 sm:w-26 sm:h-26 -rotate-90" viewBox="0 0 110 110">
                            <circle cx="55" cy="55" r={r} stroke="#e2e8f0" strokeWidth="9" fill="none" />
                            <circle
                              cx="55"
                              cy="55"
                              r={r}
                              stroke="#9333EA"
                              strokeWidth="9"
                              strokeDasharray={c}
                              strokeDashoffset={offset}
                              strokeLinecap="round"
                              fill="none"
                              className="transition-all duration-700 ease-out"
                            />
                          </svg>
                          <span className="absolute text-base sm:text-xl font-black text-slate-900 tracking-tight">
                            {val}%
                          </span>
                        </div>
                        <p className="text-[10.5px] sm:text-xs font-bold text-slate-800 mt-2 sm:mt-2.5 max-w-[125px] leading-snug">
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
                        <div className="relative w-20 h-20 sm:w-26 sm:h-26 flex items-center justify-center">
                          <svg className="w-20 h-20 sm:w-26 sm:h-26 -rotate-90" viewBox="0 0 110 110">
                            <circle cx="55" cy="55" r={r} stroke="#e2e8f0" strokeWidth="9" fill="none" />
                            <circle
                              cx="55"
                              cy="55"
                              r={r}
                              stroke="#10B981"
                              strokeWidth="9"
                              strokeDasharray={c}
                              strokeDashoffset={offset}
                              strokeLinecap="round"
                              fill="none"
                              className="transition-all duration-700 ease-out"
                            />
                          </svg>
                          <span className="absolute text-base sm:text-xl font-black text-slate-900 tracking-tight">
                            {val}%
                          </span>
                        </div>
                        <p className="text-[10.5px] sm:text-xs font-bold text-slate-800 mt-2 sm:mt-2.5 max-w-[125px] leading-snug">
                          Processing Agility
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Technical Quiz Performance Breakdown */}
              {selectedCandidate.quizBreakdown && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-[11px] sm:text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
                      Technical Quiz Breakdown
                    </h4>
                    <span className="text-[11px] font-bold text-slate-500">
                      {selectedCandidate.quizBreakdown.total} Questions • {selectedCandidate.quizBreakdown.percentage}% Accuracy
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 sm:gap-3 text-center">
                    <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-100 flex flex-col items-center justify-center">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Correct
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-emerald-700 mt-0.5 font-mono">
                        {selectedCandidate.quizBreakdown.correct}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold">Full Marks</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-100 flex flex-col items-center justify-center">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-800 flex items-center gap-1">
                        <XCircle className="h-3.5 w-3.5 text-rose-600" /> Incorrect
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-rose-700 mt-0.5 font-mono">
                        {selectedCandidate.quizBreakdown.incorrect}
                      </span>
                      <span className="text-[10px] text-rose-700 font-semibold">Wrong Answers</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-100 flex flex-col items-center justify-center">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-600" /> Skipped
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-amber-700 mt-0.5 font-mono">
                        {selectedCandidate.quizBreakdown.skipped}
                      </span>
                      <span className="text-[10px] text-amber-700 font-semibold">Unanswered</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Cognitive Games Performance & Accuracy Breakdown */}
              {Array.isArray(selectedCandidate.gamesBreakdown) && selectedCandidate.gamesBreakdown.length > 0 && (
                <div className="space-y-3 pt-2">
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
                        className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex items-center justify-between gap-2.5"
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
            </div>

            {/* Bottom Modal Footer */}
            <div className="p-4 sm:px-7 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                {selectedCandidate.status === "QUALIFIED" && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      const cand = selectedCandidate;
                      setSelectedCandidate(null);
                      openInterviewModalForSingle(cand);
                    }}
                    className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 shadow-sm shadow-indigo-500/20 cursor-pointer"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    Schedule Next Round
                  </Button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                className="h-10 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                Close Scorecard
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ── 7. NEXT ROUND INTERVIEW SCHEDULING MODAL ── */}
      <Dialog open={isInterviewModalOpen} onOpenChange={setIsInterviewModalOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden rounded-3xl border border-white/90 shadow-2xl font-sans bg-white">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#4E35E8] via-[#6D38F0] to-[#CF2E9F] p-6 text-white relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
            <div className="flex items-center gap-3 relative z-10">
              <div className="h-12 w-12 rounded-2xl bg-white/20 border border-white/30 text-white flex items-center justify-center font-black text-lg shadow-inner">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-extrabold text-white tracking-tight">
                  Schedule Next Round Interview
                </DialogTitle>
                <DialogDescription className="text-xs text-white/80 mt-0.5">
                  Send personalized email invitations with meeting link to {interviewTargets.length} selected candidate{interviewTargets.length > 1 ? "s" : ""}.
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto no-scrollbar [scrollbar-width:none]">
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
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs transition"
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
                  className={`w-full h-10 px-3.5 rounded-xl border text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 shadow-2xs transition ${
                    !interviewForm.scheduledAt
                      ? "border-amber-300 bg-amber-50/20 focus:ring-amber-500/20 focus:border-amber-500"
                      : "border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500"
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
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none shadow-2xs transition"
              />
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsInterviewModalOpen(false)}
                className="rounded-xl px-4 text-xs font-bold text-slate-600 cursor-pointer border-slate-200"
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
