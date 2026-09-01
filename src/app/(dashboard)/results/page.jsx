"use client";

import { useState, useMemo } from "react";
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
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/context";
import { useAssessmentsQuery } from "@/features/assessment/hooks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Curated Live / Evaluated Candidate Results Dataset
const INITIAL_RESULTS = [
  {
    id: "res-101",
    candidateName: "Aarav Sharma",
    email: "aarav.sharma@gmail.com",
    assessmentTitle: "Senior Full Stack Screening",
    score: 96,
    maxScore: 100,
    percentage: 96,
    status: "QUALIFIED",
    timeSpent: "24m 12s",
    completedAt: "Today, 11:30 AM",
    integrityScore: 99,
    cognitiveTraits: {
      problemSolving: 98,
      memoryRecall: 94,
      processingSpeed: 96,
    },
    mcqScore: "48/50",
    gameScore: "48/50",
  },
  {
    id: "res-102",
    candidateName: "Priya Patel",
    email: "priya.patel@outlook.com",
    assessmentTitle: "Frontend Engineering Assessment",
    score: 92,
    maxScore: 100,
    percentage: 92,
    status: "QUALIFIED",
    timeSpent: "28m 45s",
    completedAt: "Today, 10:15 AM",
    integrityScore: 100,
    cognitiveTraits: {
      problemSolving: 90,
      memoryRecall: 95,
      processingSpeed: 91,
    },
    mcqScore: "46/50",
    gameScore: "46/50",
  },
  {
    id: "res-103",
    candidateName: "Vikram Malhotra",
    email: "vikram.m@techcorp.io",
    assessmentTitle: "Senior Full Stack Screening",
    score: 88,
    maxScore: 100,
    percentage: 88,
    status: "QUALIFIED",
    timeSpent: "31m 10s",
    completedAt: "Yesterday, 4:20 PM",
    integrityScore: 97,
    cognitiveTraits: {
      problemSolving: 88,
      memoryRecall: 86,
      processingSpeed: 90,
    },
    mcqScore: "44/50",
    gameScore: "44/50",
  },
  {
    id: "res-104",
    candidateName: "Ananya Iyer",
    email: "ananya.iyer@gmail.com",
    assessmentTitle: "Cognitive Problem Solving Evaluation",
    score: 84,
    maxScore: 100,
    percentage: 84,
    status: "QUALIFIED",
    timeSpent: "19m 50s",
    completedAt: "Yesterday, 2:00 PM",
    integrityScore: 98,
    cognitiveTraits: {
      problemSolving: 85,
      memoryRecall: 82,
      processingSpeed: 85,
    },
    mcqScore: "40/50",
    gameScore: "44/50",
  },
  {
    id: "res-105",
    candidateName: "Rohan Verma",
    email: "rohan.verma@yahoo.com",
    assessmentTitle: "Frontend Engineering Assessment",
    score: 74,
    maxScore: 100,
    percentage: 74,
    status: "IN_REVIEW",
    timeSpent: "35m 00s",
    completedAt: "Aug 30, 2026",
    integrityScore: 95,
    cognitiveTraits: {
      problemSolving: 72,
      memoryRecall: 76,
      processingSpeed: 74,
    },
    mcqScore: "36/50",
    gameScore: "38/50",
  },
  {
    id: "res-106",
    candidateName: "Sneha Reddy",
    email: "sneha.reddy@gmail.com",
    assessmentTitle: "Senior Full Stack Screening",
    score: 58,
    maxScore: 100,
    percentage: 58,
    status: "FAILED",
    timeSpent: "42m 10s",
    completedAt: "Aug 29, 2026",
    integrityScore: 92,
    cognitiveTraits: {
      problemSolving: 55,
      memoryRecall: 60,
      processingSpeed: 59,
    },
    mcqScore: "30/50",
    gameScore: "28/50",
  },
];

export default function ResultsAndRankingPage() {
  const { user } = useAuth();
  const rawName = user?.name || user?.fullName || "Sarah Jenkins";
  const userName = rawName.replace(/\s+user$/i, "").trim() || "Sarah Jenkins";

  const { data: apiAssessments = [] } = useAssessmentsQuery();

  const [results, setResults] = useState(INITIAL_RESULTS);
  const [search, setSearch] = useState("");
  const [selectedAssessment, setSelectedAssessment] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("rank");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Detailed Candidate Scorecard Modal
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const filteredResults = useMemo(() => {
    return results
      .filter((item) => {
        const matchesSearch =
          !search ||
          item.candidateName.toLowerCase().includes(search.toLowerCase()) ||
          item.email.toLowerCase().includes(search.toLowerCase()) ||
          item.assessmentTitle.toLowerCase().includes(search.toLowerCase());

        const matchesAssessment =
          selectedAssessment === "ALL" ||
          item.assessmentTitle.toLowerCase() === selectedAssessment.toLowerCase();

        const matchesStatus =
          statusFilter === "ALL" || item.status === statusFilter;

        return matchesSearch && matchesAssessment && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "rank" || sortBy === "score") return b.score - a.score;
        if (sortBy === "speed") return a.timeSpent.localeCompare(b.timeSpent);
        return a.candidateName.localeCompare(b.candidateName);
      });
  }, [results, search, selectedAssessment, statusFilter, sortBy]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Leaderboard results synchronized!");
    }, 400);
  };

  const handleExportCSV = () => {
    const headers = "Rank,Candidate Name,Email,Assessment,Score,Percentage,Status,Time Spent,Integrity\n";
    const rows = filteredResults
      .map(
        (r, i) =>
          `#${i + 1},"${r.candidateName}","${r.email}","${r.assessmentTitle}",${r.score}/${r.maxScore},${r.percentage}%,${r.status},"${r.timeSpent}",${r.integrityScore}%`
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

  const getRankMedal = (index) => {
    if (index === 0) return <span className="text-lg">🥇</span>;
    if (index === 1) return <span className="text-lg">🥈</span>;
    if (index === 2) return <span className="text-lg">🥉</span>;
    return <span className="font-extrabold text-xs text-slate-500">#{index + 1}</span>;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* ── 1. UNIFIED SINGLE HEADER ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Results & Candidate Ranking
            </h1>
            <Badge className="bg-amber-50 text-amber-700 border-amber-300 text-[10.5px] font-extrabold gap-1">
              <Trophy className="h-3 w-3 text-amber-600" />
              Live Leaderboard
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Comprehensive evaluation leaderboard, cognitive percentiles, and assessment scoring analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* User HR Chip */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-semibold shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span className="font-bold text-slate-900">{userName}</span>
            <span className="text-[10px] font-extrabold uppercase bg-blue-50 text-blue-700 border border-blue-200/70 px-1.5 py-0.5 rounded ml-0.5">
              HR
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-9 px-3 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold gap-1.5 shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
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

      {/* ── 2. EXECUTIVE METRIC KPI CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Completed Tests */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Evaluations Scored
            </span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              {results.length}
            </p>
            <p className="text-xs text-blue-600 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="h-3.5 w-3.5" />
              100% automated scoring
            </p>
          </div>
        </div>

        {/* Card 2: Average Score */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Mean Batch Score
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              {Math.round(
                results.reduce((acc, r) => acc + r.percentage, 0) / results.length
              )}%
            </p>
            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              66.7% Qualified benchmark
            </p>
          </div>
        </div>

        {/* Card 3: Top Decile Shortlist */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Top Tier Shortlist
            </span>
            <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <Trophy className="h-4 w-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              {results.filter((r) => r.percentage >= 85).length}
            </p>
            <p className="text-xs text-purple-600 font-semibold flex items-center gap-1 mt-1">
              Scored ≥ 85th Percentile
            </p>
          </div>
        </div>

        {/* Card 4: Integrity Verified */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Proctoring Integrity
            </span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              98.2%
            </p>
            <p className="text-xs text-amber-700 font-semibold flex items-center gap-1 mt-1">
              Zero tab switches detected
            </p>
          </div>
        </div>
      </div>

      {/* ── 3. PODIUM HIGHLIGHT FOR TOP 3 CANDIDATES ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {results.slice(0, 3).map((candidate, idx) => (
          <div
            key={candidate.id}
            onClick={() => setSelectedCandidate(candidate)}
            className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-white to-slate-50 p-5 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer space-y-3 relative overflow-hidden group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}</span>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Rank #{idx + 1}
                </span>
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
              <span>{candidate.assessmentTitle}</span>
              <span className="text-blue-600 font-bold text-[11px] group-hover:underline flex items-center gap-1">
                View Scorecard ➔
              </span>
            </div>
          </div>
        ))}
      </div>

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
            onChange={(e) => setSelectedAssessment(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
          >
            <option value="ALL">All Assessments</option>
            <option value="Senior Full Stack Screening">Senior Full Stack Screening</option>
            <option value="Frontend Engineering Assessment">Frontend Engineering Assessment</option>
            <option value="Cognitive Problem Solving Evaluation">Cognitive Problem Solving Evaluation</option>
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
        </div>
      </div>

      {/* ── 5. FULL RANKINGS DATA TABLE ── */}
      <div className="rounded-2xl border bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead className="bg-slate-50/80 border-b text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-5 w-16 text-center">Rank</th>
                <th className="py-3.5 px-6">Candidate</th>
                <th className="py-3.5 px-6">Assessment Module</th>
                <th className="py-3.5 px-6">Cognitive Breakdown</th>
                <th className="py-3.5 px-6 text-center">Score & Pass %</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredResults.map((item, index) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition group">
                  {/* Rank */}
                  <td className="py-4 px-5 text-center font-extrabold">
                    {getRankMedal(index)}
                  </td>

                  {/* Candidate */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                        {item.candidateName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
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
                  <td className="py-4 px-6">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-800">{item.assessmentTitle}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {item.timeSpent} • {item.completedAt}
                      </p>
                    </div>
                  </td>

                  {/* Cognitive Breakdown Mini Pills */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold" title="Problem Solving">
                        Logic {item.cognitiveTraits.problemSolving}%
                      </span>
                      <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold" title="Memory Recall">
                        Memory {item.cognitiveTraits.memoryRecall}%
                      </span>
                    </div>
                  </td>

                  {/* Score */}
                  <td className="py-4 px-6 text-center">
                    <span className="font-black text-sm text-slate-900">
                      {item.score}/{item.maxScore}
                    </span>
                    <span className="block text-[11px] font-bold text-emerald-600">
                      ({item.percentage}%)
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6">
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
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCandidate(item)}
                      className="h-8 px-3 rounded-xl border-slate-200 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-bold gap-1 shadow-2xs cursor-pointer transition"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Scorecard
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 6. DETAILED CANDIDATE SCORECARD MODAL ── */}
      {selectedCandidate && (
        <Dialog open={Boolean(selectedCandidate)} onOpenChange={() => setSelectedCandidate(null)}>
          <DialogContent className="max-w-xl p-0 overflow-hidden rounded-3xl border-slate-200 shadow-2xl font-sans bg-white">
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 text-white relative">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center font-black text-lg shadow-inner">
                  {selectedCandidate.candidateName.charAt(0)}
                </div>
                <div>
                  <DialogTitle className="text-xl font-extrabold text-white tracking-tight">
                    {selectedCandidate.candidateName}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-300 mt-0.5">
                    {selectedCandidate.email} • {selectedCandidate.assessmentTitle}
                  </DialogDescription>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Score Highlight Box */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div>
                  <span className="text-[10.5px] font-bold uppercase text-slate-400">Total Score</span>
                  <p className="text-2xl font-black text-slate-900">{selectedCandidate.score}/100</p>
                </div>
                <div>
                  <span className="text-[10.5px] font-bold uppercase text-slate-400">Time Taken</span>
                  <p className="text-2xl font-black text-slate-900">{selectedCandidate.timeSpent}</p>
                </div>
                <div>
                  <span className="text-[10.5px] font-bold uppercase text-slate-400">Integrity</span>
                  <p className="text-2xl font-black text-emerald-600">{selectedCandidate.integrityScore}%</p>
                </div>
              </div>

              {/* Cognitive Trait Bars */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                  Calibrated Cognitive Trait Performance
                </h4>

                <div className="space-y-2.5">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                      <span>Problem Solving & Logical Reasoning</span>
                      <span className="font-bold text-blue-600">{selectedCandidate.cognitiveTraits.problemSolving}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-blue-600" style={{ width: `${selectedCandidate.cognitiveTraits.problemSolving}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                      <span>Working Memory Recall</span>
                      <span className="font-bold text-purple-600">{selectedCandidate.cognitiveTraits.memoryRecall}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-purple-600" style={{ width: `${selectedCandidate.cognitiveTraits.memoryRecall}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                      <span>Mental Processing Agility</span>
                      <span className="font-bold text-emerald-600">{selectedCandidate.cognitiveTraits.processingSpeed}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-600" style={{ width: `${selectedCandidate.cognitiveTraits.processingSpeed}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Module Section Breakdown */}
              <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-slate-100">
                <div className="p-3 rounded-xl border border-slate-200 bg-white">
                  <span className="text-slate-500 font-medium">MCQ Section:</span>
                  <p className="font-extrabold text-slate-900 text-sm mt-0.5">{selectedCandidate.mcqScore}</p>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-white">
                  <span className="text-slate-500 font-medium">Cognitive Games Section:</span>
                  <p className="font-extrabold text-slate-900 text-sm mt-0.5">{selectedCandidate.gameScore}</p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={() => setSelectedCandidate(null)}
                  className="rounded-xl px-5 text-xs font-bold"
                >
                  Close Scorecard
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
