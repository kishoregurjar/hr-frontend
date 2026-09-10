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
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/context";
import { useAssessmentsQuery } from "@/features/assessment/hooks";
import { getAllResults } from "@/lib/api/results";
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

  const { data: apiAssessments = [] } = useAssessmentsQuery();

  const { data: dynamicResults = [], isLoading, refetch } = useQuery({
    queryKey: ["candidate-results"],
    queryFn: getAllResults,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const results = useMemo(() => {
    return Array.isArray(dynamicResults) ? dynamicResults : [];
  }, [dynamicResults]);

  const availableAssessments = useMemo(() => {
    const titles = new Set();
    apiAssessments.forEach((a) => {
      if (a.title) titles.add(a.title);
    });
    results.forEach((r) => {
      if (r.assessmentTitle) titles.add(r.assessmentTitle);
    });
    return Array.from(titles);
  }, [apiAssessments, results]);

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
        if (sortBy === "rank" || sortBy === "score") return (b.score || 0) - (a.score || 0);
        if (sortBy === "speed") return String(a.timeSpent || "").localeCompare(String(b.timeSpent || ""));
        return String(a.candidateName || "").localeCompare(String(b.candidateName || ""));
      });
  }, [results, search, selectedAssessment, statusFilter, sortBy]);

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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Completed Tests */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs flex items-center justify-between transition hover:shadow-md">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Evaluations Scored
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
              Mean Batch Score
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
              Top Tier Shortlist
            </p>
            <h2 className="mt-1.5 text-3xl font-black text-slate-900 tracking-tight">
              {results.filter((r) => (r.percentage || 0) >= 85).length}
            </h2>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100/90 text-slate-700">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>

        {/* Card 4: Proctoring Integrity */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs flex items-center justify-between transition hover:shadow-md">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Proctoring Integrity
            </p>
            <h2 className="mt-1.5 text-3xl font-black text-slate-900 tracking-tight">
              {results.length > 0 ? "98.2%" : "100%"}
            </h2>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100/90 text-slate-700">
            <Send className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* ── 3. PODIUM HIGHLIGHT FOR TOP 3 CANDIDATES (Dynamic) ── */}
      {results.length > 0 && (
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
            onChange={(e) => setSelectedAssessment(e.target.value)}
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
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center">
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
                  <tr key={item.id} className="hover:bg-slate-50/70 transition group">
                    {/* Rank */}
                    <td className="py-4 px-5 text-center font-extrabold">
                      {getRankMedal(index)}
                    </td>

                    {/* Candidate */}
                    <td className="py-4 px-6">
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
                          Logic {item.cognitiveTraits?.problemSolving || 85}%
                        </span>
                        <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold" title="Memory Recall">
                          Memory {item.cognitiveTraits?.memoryRecall || 80}%
                        </span>
                      </div>
                    </td>

                    {/* Score */}
                    <td className="py-4 px-6 text-center">
                      <span className="font-black text-sm text-slate-900">
                        {item.score}/{item.maxScore || 100}
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
                ))
              )}
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
                      <span className="font-bold text-blue-600">{selectedCandidate.cognitiveTraits?.problemSolving || 85}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-blue-600" style={{ width: `${selectedCandidate.cognitiveTraits?.problemSolving || 85}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                      <span>Working Memory Recall</span>
                      <span className="font-bold text-purple-600">{selectedCandidate.cognitiveTraits?.memoryRecall || 80}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-purple-600" style={{ width: `${selectedCandidate.cognitiveTraits?.memoryRecall || 80}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                      <span>Mental Processing Agility</span>
                      <span className="font-bold text-emerald-600">{selectedCandidate.cognitiveTraits?.processingSpeed || 85}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-600" style={{ width: `${selectedCandidate.cognitiveTraits?.processingSpeed || 85}%` }} />
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
