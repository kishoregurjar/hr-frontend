"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Building2,
  Users,
  Gamepad2,
  CheckCircle2,
  Award,
  Calendar,
  Sparkles,
} from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { getAdminMetrics, getAdminGames } from "@/lib/api/admin";
import { Badge } from "@/components/ui/badge";

export default function AdminAnalyticsPage() {
  const [metrics, setMetrics] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [m, g] = await Promise.all([getAdminMetrics(), getAdminGames()]);
        setMetrics(m);
        setGames(g);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <AdminHeader
        title="Platform-Wide Analytics"
        subtitle="Global Recruitment & Candidate Assessment Telemetry (PRD Section 16)"
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl">
        {/* ── 1. Key Performance Indicators (Section 16 PRD) ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="rounded-2xl border bg-card p-4 shadow-sm space-y-1">
            <p className="text-[11px] font-bold uppercase text-muted-foreground">
              Total Companies
            </p>
            <p className="text-2xl font-extrabold text-slate-900">
              {metrics?.totalCompanies ?? 0}
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-4 shadow-sm space-y-1">
            <p className="text-[11px] font-bold uppercase text-muted-foreground">
              Active Jobs
            </p>
            <p className="text-2xl font-extrabold text-slate-900">
              {metrics?.totalAssessmentsCreated ?? 0}
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-4 shadow-sm space-y-1">
            <p className="text-[11px] font-bold uppercase text-muted-foreground">
              Assessed Candidates
            </p>
            <p className="text-2xl font-extrabold text-slate-900">
              {(metrics?.totalCandidatesAssessed ?? 0).toLocaleString()}
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-4 shadow-sm space-y-1">
            <p className="text-[11px] font-bold uppercase text-muted-foreground">
              Tests Completed
            </p>
            <p className="text-2xl font-extrabold text-emerald-600">
              {Math.round(
                (metrics?.totalCandidatesAssessed ?? 0) *
                  ((metrics?.averageCompletionRate ?? 0) / 100)
              ).toLocaleString()}
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-4 shadow-sm space-y-1">
            <p className="text-[11px] font-bold uppercase text-muted-foreground">
              Avg. Completion
            </p>
            <p className="text-2xl font-extrabold text-purple-600">
              {metrics?.averageCompletionRate ?? 0}%
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-4 shadow-sm space-y-1">
            <p className="text-[11px] font-bold uppercase text-muted-foreground">
              Avg. Score
            </p>
            <p className="text-2xl font-extrabold text-blue-600">
              {metrics?.averageCandidateScore ?? 0}%
            </p>
          </div>
        </div>

        {/* ── 2. Most-Used Cognitive Games (PRD Section 16) ── */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Gamepad2 className="h-5 w-5 text-blue-600" />
                Most-Used Cognitive Assessment Games
              </h2>
              <p className="text-xs text-muted-foreground">
                Games with the highest adoption across HR assessment pipelines.
              </p>
            </div>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              Ranked by Test Volume
            </Badge>
          </div>

          {games.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {games.map((game, index) => (
                <div
                  key={game.id}
                  className="rounded-xl border p-4 bg-slate-50/60 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">
                      #{index + 1}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-bold">
                      {game.assessmentsUsedIn || 0} Assessments
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                      <Gamepad2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900">{game.name}</p>
                      <p className="text-[11px] text-muted-foreground font-medium">
                        {game.category || "Cognitive"} • {game.averagePlayTime || "3-5 mins"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center space-y-2">
              <Gamepad2 className="h-8 w-8 mx-auto text-slate-300" />
              <p className="text-xs font-bold text-slate-700">No game usage data yet</p>
              <p className="text-[11px] text-slate-400">Usage statistics will appear once candidates complete game assessments.</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
