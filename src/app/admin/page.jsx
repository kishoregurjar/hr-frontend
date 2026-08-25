"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  Gamepad2,
  TrendingUp,
  Award,
  CheckCircle2,
  ArrowUpRight,
  Zap,
  Activity,
} from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { getAdminMetrics, getAdminCompanies, getAdminGames } from "@/lib/api/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminOverviewPage() {
  const [metrics, setMetrics] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [m, c, g] = await Promise.all([
          getAdminMetrics(),
          getAdminCompanies(),
          getAdminGames(),
        ]);
        setMetrics(m);
        setCompanies(c);
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
        title="Platform Master Overview"
        subtitle="Minders World Recruitment Ecosystem Live Statistics"
      />

      <main className="flex-1 p-6 sm:p-8 space-y-8 max-w-7xl font-sans">
        {/* ── 1. Executive Metric Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Companies */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Client Companies
              </span>
              <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Building2 className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900 tracking-tight">
                {metrics?.totalCompanies ?? 28}
              </p>
              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                <TrendingUp className="h-3.5 w-3.5" />
                {metrics?.activeCompanies ?? 24} actively testing candidates
              </p>
            </div>
          </div>

          {/* Card 2: Candidates Assessed */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Candidates Assessed
              </span>
              <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900 tracking-tight">
                {(metrics?.totalCandidatesAssessed ?? 4890).toLocaleString()}
              </p>
              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                <TrendingUp className="h-3.5 w-3.5" />
                +18.4% month-over-month
              </p>
            </div>
          </div>

          {/* Card 3: Completion Rate */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Avg. Completion Rate
              </span>
              <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900 tracking-tight">
                {metrics?.averageCompletionRate ?? 88.4}%
              </p>
              <p className="text-xs text-purple-600 font-semibold flex items-center gap-1 mt-1">
                <Award className="h-3.5 w-3.5" />
                High candidate engagement
              </p>
            </div>
          </div>

          {/* Card 4: Active Cognitive Games */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Active Games Engine
              </span>
              <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <Gamepad2 className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900 tracking-tight">
                {games.length || 6}
              </p>
              <p className="text-xs text-amber-700 font-semibold flex items-center gap-1 mt-1">
                <Zap className="h-3.5 w-3.5" />
                Zip, Sudoku, Tango & 3 more
              </p>
            </div>
          </div>
        </div>

        {/* ── 2. Two-Column Dashboard Grids ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Client Companies Directory Preview */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  Top Client Companies & Tenant Status
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Companies utilizing Minders World assessments for recruitment.
                </p>
              </div>
              <Link href="/admin/companies">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs font-semibold gap-1 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl shadow-2xs"
                >
                  View All Companies
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {companies.slice(0, 4).map((company) => (
                <div
                  key={company.id}
                  className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                      {company.logo}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {company.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {company.hrContact} • {company.domain}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge
                      variant="outline"
                      className="text-[11px] font-semibold border-slate-200 text-slate-600 bg-slate-50"
                    >
                      {company.plan}
                    </Badge>
                    <span className="text-xs font-semibold text-slate-700 hidden sm:inline">
                      {company.candidatesAssessed} candidates
                    </span>
                    <Badge
                      className={
                        company.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-extrabold text-[10.5px]"
                          : "bg-rose-50 text-rose-700 border-rose-300 font-extrabold text-[10.5px]"
                      }
                    >
                      {company.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right 1 Col: Cognitive Skill Engine Distribution */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-5">
            <div className="pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-600" />
                Top Measured Skills
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Competencies measured across candidate assessments.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { name: "Logical Reasoning", percent: 92, color: "bg-blue-600" },
                { name: "Problem Solving", percent: 86, color: "bg-indigo-600" },
                { name: "Processing Speed", percent: 79, color: "bg-purple-600" },
                { name: "Pattern Recognition", percent: 74, color: "bg-emerald-600" },
                { name: "Memory Retention", percent: 68, color: "bg-amber-500" },
              ].map((skill) => (
                <div key={skill.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-800">
                    <span>{skill.name}</span>
                    <span className="font-bold">{skill.percent}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${skill.color}`}
                      style={{ width: `${skill.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 text-center">
              <Link href="/admin/games">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl"
                >
                  Manage Game Skill Mappings ➔
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
