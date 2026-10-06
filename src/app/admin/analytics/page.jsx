"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Gamepad2,
  Loader2,
  AlertCircle,
  RefreshCw,
  Calendar,
  Filter,
  TrendingUp,
  Activity,
  Award,
  CheckCircle2,
  BarChart3,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  getAdminAnalytics,
  getAdminGames,
  exportPlatformAnalyticsCsv,
  exportPlatformAnalyticsPdf,
} from "@/lib/api/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminAnalyticsPage() {
  const [summary, setSummary] = useState(null);
  const [dateRangeMeta, setDateRangeMeta] = useState(null);
  const [trends, setTrends] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Export Loading States
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Filter States (Default: 30d preset)
  const [preset, setPreset] = useState("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [activeParams, setActiveParams] = useState({ preset: "30d" });

  const triggerBlobDownload = (blobData, filename) => {
    const blob = blobData instanceof Blob ? blobData : new Blob([blobData]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleExportCsv = async () => {
    if (isExportingCsv) return;
    setIsExportingCsv(true);
    setError(null);
    try {
      const blob = await exportPlatformAnalyticsCsv(activeParams);
      const filename =
        preset !== "custom"
          ? `hirequest-platform-analytics-${preset}.csv`
          : `hirequest-platform-analytics-${customFrom || "custom"}-to-${customTo || "custom"}.csv`;
      triggerBlobDownload(blob, filename);
    } catch (err) {
      console.error("CSV Export failed:", err);
      setError("Unable to export CSV. Please try again.");
    } finally {
      setIsExportingCsv(false);
    }
  };

  const handleExportPdf = async () => {
    if (isExportingPdf) return;
    setIsExportingPdf(true);
    setError(null);
    try {
      const blob = await exportPlatformAnalyticsPdf(activeParams);
      const filename =
        preset !== "custom"
          ? `hirequest-platform-analytics-${preset}.pdf`
          : `hirequest-platform-analytics-${customFrom || "custom"}-to-${customTo || "custom"}.pdf`;
      triggerBlobDownload(blob, filename);
    } catch (err) {
      console.error("PDF Export failed:", err);
      setError("Unable to generate PDF. Please try again.");
    } finally {
      setIsExportingPdf(false);
    }
  };


  const fetchData = useCallback(async (params = activeParams) => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, gamesRes] = await Promise.allSettled([
        getAdminAnalytics(params),
        getAdminGames(),
      ]);

      if (analyticsRes.status === "fulfilled" && analyticsRes.value?.summary) {
        setSummary(analyticsRes.value.summary);
        setDateRangeMeta(analyticsRes.value.dateRange || null);
        setTrends(analyticsRes.value.trends || null);

        if (Array.isArray(analyticsRes.value.games) && analyticsRes.value.games.length > 0) {
          setGames(analyticsRes.value.games);
        }
      } else if (analyticsRes.status === "rejected") {
        const errObj = analyticsRes.reason;
        const msg =
          errObj?.response?.data?.message ||
          errObj?.message ||
          "Failed to load analytics telemetry.";
        throw new Error(msg);
      }

      if (gamesRes.status === "fulfilled" && Array.isArray(gamesRes.value) && gamesRes.value.length > 0) {
        setGames((prevGames) => (prevGames.length === 0 ? gamesRes.value : prevGames));
      }
    } catch (err) {
      console.error("Failed to load platform analytics:", err);
      setError(err?.message || "Could not retrieve real-time platform telemetry data.");
    } finally {
      setLoading(false);
    }
  }, [activeParams]);

  useEffect(() => {
    fetchData(activeParams);
  }, [activeParams, fetchData]);

  const handlePresetChange = (newPreset) => {
    setPreset(newPreset);
    if (newPreset !== "custom") {
      const queryParams = newPreset === "all" ? {} : { preset: newPreset };
      setActiveParams(queryParams);
    }
  };

  const handleApplyCustomFilter = (e) => {
    e.preventDefault();
    if (!customFrom || !customTo) {
      setError("Please specify both Start Date and End Date for custom filter.");
      return;
    }
    if (new Date(customFrom) > new Date(customTo)) {
      setError("Start Date cannot be after End Date.");
      return;
    }
    setActiveParams({
      preset: "custom",
      dateFrom: customFrom,
      dateTo: customTo,
    });
  };

  const formatDisplayDate = (isoStr) => {
    if (!isoStr) return "";
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return isoStr;
    }
  };

  // Check if trends are empty (all zero activity)
  const isCandidateActivityEmpty =
    !trends?.candidateActivity ||
    trends.candidateActivity.every((item) => item.started === 0 && item.completed === 0);

  const isTestCompletionEmpty =
    !trends?.testCompletion ||
    trends.testCompletion.every((item) => item.started === 0 && item.submitted === 0);

  const isAvgScoreEmpty =
    !trends?.averageScore ||
    trends.averageScore.every((item) => item.averageScore === 0);

  const isCompletionRateEmpty =
    !trends?.completionRate ||
    trends.completionRate.every((item) => item.completionRate === 0);

  return (
    <>
      <AdminHeader
        title="Platform-Wide Analytics"
        subtitle="Global Recruitment & Candidate Assessment Telemetry (PRD Section 16)"
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl">
        {/* ── 1. Date Range Filter Controls ── */}
        <div className="rounded-2xl border bg-card p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Telemetry Time Horizon</h3>
                <p className="text-[11px] text-muted-foreground">
                  Filter activity metrics across predefined intervals or custom dates
                </p>
              </div>
            </div>

            {/* Active Range Badge & Export Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {dateRangeMeta && (
                <Badge variant="outline" className="bg-slate-50 text-slate-700 font-semibold text-xs py-1 px-3 w-fit hidden sm:inline-flex">
                  {dateRangeMeta.preset === "all"
                    ? "All-Time Platform Activity"
                    : `${formatDisplayDate(dateRangeMeta.dateFrom)} — ${formatDisplayDate(dateRangeMeta.dateTo)} (UTC)`}
                </Badge>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCsv}
                disabled={isExportingCsv || loading}
                className="h-8 border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs rounded-xl shadow-xs gap-1.5 cursor-pointer"
              >
                {isExportingCsv ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                    Export CSV
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPdf}
                disabled={isExportingPdf || loading}
                className="h-8 border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs rounded-xl shadow-xs gap-1.5 cursor-pointer"
              >
                {isExportingPdf ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="h-3.5 w-3.5 text-rose-600" />
                    Export PDF
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "7d", label: "Last 7 Days" },
              { id: "30d", label: "Last 30 Days" },
              { id: "90d", label: "Last 90 Days" },
              { id: "all", label: "All Time" },
              { id: "custom", label: "Custom Range" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handlePresetChange(item.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  preset === item.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Custom Date Selector */}
          {preset === "custom" && (
            <form onSubmit={handleApplyCustomFilter} className="flex flex-wrap items-end gap-3 pt-2">
              <div className="space-y-1">
                <label htmlFor="analyticsDateFrom" className="text-[11px] font-bold text-slate-600 uppercase">
                  Start Date *
                </label>
                <Input
                  id="analyticsDateFrom"
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="h-9 rounded-xl border-slate-200 text-xs font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="analyticsDateTo" className="text-[11px] font-bold text-slate-600 uppercase">
                  End Date *
                </label>
                <Input
                  id="analyticsDateTo"
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="h-9 rounded-xl border-slate-200 text-xs font-medium"
                  required
                />
              </div>

              <Button
                type="submit"
                size="sm"
                disabled={loading || !customFrom || !customTo}
                className="h-9 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs gap-1.5 cursor-pointer"
              >
                <Filter className="h-3.5 w-3.5" /> Apply Filter
              </Button>
            </form>
          )}
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-xs text-rose-900 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span className="font-semibold">{error}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchData(activeParams)}
              className="h-8 border-rose-300 text-rose-800 hover:bg-rose-100 font-bold text-xs gap-1.5 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Retry
            </Button>
          </div>
        )}

        {/* ── 2. KPI Summary Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="rounded-2xl border bg-card p-4 shadow-xs space-y-1">
            <p className="text-[11px] font-bold uppercase text-muted-foreground">Total Companies</p>
            {loading ? (
              <div className="h-7 w-12 bg-slate-100 animate-pulse rounded-md mt-1" />
            ) : (
              <p className="text-2xl font-extrabold text-slate-900">{summary?.totalCompanies ?? 0}</p>
            )}
          </div>

          <div className="rounded-2xl border bg-card p-4 shadow-xs space-y-1">
            <p className="text-[11px] font-bold uppercase text-muted-foreground">Active Jobs</p>
            {loading ? (
              <div className="h-7 w-12 bg-slate-100 animate-pulse rounded-md mt-1" />
            ) : (
              <p className="text-2xl font-extrabold text-slate-900">{summary?.activeJobs ?? 0}</p>
            )}
          </div>

          <div className="rounded-2xl border bg-card p-4 shadow-xs space-y-1">
            <p className="text-[11px] font-bold uppercase text-muted-foreground">Assessed Candidates</p>
            {loading ? (
              <div className="h-7 w-12 bg-slate-100 animate-pulse rounded-md mt-1" />
            ) : (
              <p className="text-2xl font-extrabold text-slate-900">
                {(summary?.assessedCandidates ?? 0).toLocaleString()}
              </p>
            )}
          </div>

          <div className="rounded-2xl border bg-card p-4 shadow-xs space-y-1">
            <p className="text-[11px] font-bold uppercase text-muted-foreground">Tests Completed</p>
            {loading ? (
              <div className="h-7 w-12 bg-slate-100 animate-pulse rounded-md mt-1" />
            ) : (
              <p className="text-2xl font-extrabold text-emerald-600">
                {(summary?.testsCompleted ?? 0).toLocaleString()}
              </p>
            )}
          </div>

          <div className="rounded-2xl border bg-card p-4 shadow-xs space-y-1">
            <p className="text-[11px] font-bold uppercase text-muted-foreground">Avg. Completion</p>
            {loading ? (
              <div className="h-7 w-12 bg-slate-100 animate-pulse rounded-md mt-1" />
            ) : (
              <p className="text-2xl font-extrabold text-purple-600">
                {summary?.averageCompletionRate ?? 0}%
              </p>
            )}
          </div>

          <div className="rounded-2xl border bg-card p-4 shadow-xs space-y-1">
            <p className="text-[11px] font-bold uppercase text-muted-foreground">Avg. Score</p>
            {loading ? (
              <div className="h-7 w-12 bg-slate-100 animate-pulse rounded-md mt-1" />
            ) : (
              <p className="text-2xl font-extrabold text-blue-600">
                {summary?.averageScore ?? 0}%
              </p>
            )}
          </div>
        </div>

        {/* ── 3. Interactive Trend Charts (Grid) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart A: Candidate Activity Trend */}
          <div className="rounded-2xl border bg-card p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-indigo-600" />
                  Candidate Activity Trend
                </h3>
                <p className="text-xs text-muted-foreground">
                  Initiated candidate attempts vs completed assessments
                </p>
              </div>
            </div>

            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
              </div>
            ) : isCandidateActivityEmpty ? (
              <div className="h-64 flex flex-col items-center justify-center text-center space-y-2">
                <Activity className="h-8 w-8 text-slate-300" />
                <p className="text-xs font-bold text-slate-700">No activity for this date range</p>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  Candidate assessment attempts will plot dynamically once tests are taken.
                </p>
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends?.candidateActivity || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDisplayDate}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                    <Tooltip
                      labelFormatter={formatDisplayDate}
                      contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                    <Area
                      type="monotone"
                      dataKey="started"
                      name="Started Candidates"
                      stroke="#4f46e5"
                      fill="#818cf8"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="completed"
                      name="Completed Tests"
                      stroke="#10b981"
                      fill="#34d399"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Chart B: Test Completion Trend */}
          <div className="rounded-2xl border bg-card p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Test Completion Trend
                </h3>
                <p className="text-xs text-muted-foreground">
                  Assessment attempts initiated vs submitted
                </p>
              </div>
            </div>

            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
              </div>
            ) : isTestCompletionEmpty ? (
              <div className="h-64 flex flex-col items-center justify-center text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-slate-300" />
                <p className="text-xs font-bold text-slate-700">No completions for this date range</p>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  Submitted tests will plot dynamically over time.
                </p>
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends?.testCompletion || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDisplayDate}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                    <Tooltip
                      labelFormatter={formatDisplayDate}
                      contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                    <Line
                      type="monotone"
                      dataKey="started"
                      name="Started Attempts"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="submitted"
                      name="Submitted Attempts"
                      stroke="#0d9488"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Chart C: Average Score Trend */}
          <div className="rounded-2xl border bg-card p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Award className="h-4 w-4 text-purple-600" />
                  Average Score Trend
                </h3>
                <p className="text-xs text-muted-foreground">
                  Mean candidate score percentage (0–100%)
                </p>
              </div>
            </div>

            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
              </div>
            ) : isAvgScoreEmpty ? (
              <div className="h-64 flex flex-col items-center justify-center text-center space-y-2">
                <Award className="h-8 w-8 text-slate-300" />
                <p className="text-xs font-bold text-slate-700">No score data for this date range</p>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  Scores will plot when candidates finish submitted tests.
                </p>
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends?.averageScore || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDisplayDate}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                    />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} />
                    <Tooltip
                      labelFormatter={formatDisplayDate}
                      formatter={(val) => [`${val}%`, "Average Score"]}
                      contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="averageScore"
                      name="Average Score"
                      stroke="#8b5cf6"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Chart D: Completion Rate Trend */}
          <div className="rounded-2xl border bg-card p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-amber-600" />
                  Completion Rate Trend
                </h3>
                <p className="text-xs text-muted-foreground">
                  Ratio of submitted attempts to started attempts (0–100%)
                </p>
              </div>
            </div>

            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
              </div>
            ) : isCompletionRateEmpty ? (
              <div className="h-64 flex flex-col items-center justify-center text-center space-y-2">
                <TrendingUp className="h-8 w-8 text-slate-300" />
                <p className="text-xs font-bold text-slate-700">No completion rate data for this range</p>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  Rate trends will calculate automatically when attempts occur.
                </p>
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends?.completionRate || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDisplayDate}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                    />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} />
                    <Tooltip
                      labelFormatter={formatDisplayDate}
                      formatter={(val) => [`${val}%`, "Completion Rate"]}
                      contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="completionRate"
                      name="Completion Rate"
                      stroke="#f59e0b"
                      fill="#fbbf24"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* ── 4. Game Usage Ranking Chart ── */}
        <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Most-Used Cognitive Assessment Games
              </h2>
              <p className="text-xs text-muted-foreground">
                Real game adoption volume across platform assessment pipelines.
              </p>
            </div>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-bold">
              Ranked by Test Volume
            </Badge>
          </div>

          {loading ? (
            <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
              <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
              <p className="text-xs text-slate-500 font-medium">Loading game telemetry...</p>
            </div>
          ) : games.length > 0 ? (
            <div className="space-y-6">
              {/* Horizontal Bar Chart Visualization */}
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={games} layout="vertical" margin={{ left: 20, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                    <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11, fill: "#334155", fontWeight: 600 }} />
                    <Tooltip
                      formatter={(val) => [`${val} Assessments`, "Test Volume"]}
                      contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                    />
                    <Bar dataKey="assessmentsUsedIn" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Game Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                {games.map((game, index) => (
                  <div key={game.id} className="rounded-xl border p-4 bg-slate-50/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">#{index + 1}</span>
                      <Badge variant="outline" className="text-[10px] font-bold">
                        {game.assessmentsUsedIn || 0} Assessments
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                        <Gamepad2 className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-slate-900 truncate">{game.name}</p>
                        <p className="text-[10.5px] text-muted-foreground font-medium truncate">
                          {game.category || "Cognitive"} • {game.averagePlayTime || "3-5 mins"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center space-y-2">
              <Gamepad2 className="h-8 w-8 mx-auto text-slate-300" />
              <p className="text-xs font-bold text-slate-700">No game usage data yet</p>
              <p className="text-[11px] text-slate-400">
                Usage statistics will appear once candidates complete game assessments.
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
