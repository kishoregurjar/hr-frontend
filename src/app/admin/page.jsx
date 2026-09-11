"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  ShieldCheck,
  TrendingUp,
  Plus,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Clock,
  Briefcase,
  ExternalLink,
  Loader2,
  RefreshCw,
} from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { getAdminMetrics, getAdminCompanies } from "@/lib/api/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Module-level in-memory cache for instant 0ms tab switching (Stale-While-Revalidate)
let adminOverviewCache = {
  metrics: null,
  companies: null,
  timestamp: 0,
};

export default function AdminOverviewPage() {
  const [metrics, setMetrics] = useState(adminOverviewCache.metrics);
  const [companies, setCompanies] = useState(adminOverviewCache.companies || []);
  const [loading, setLoading] = useState(!adminOverviewCache.metrics && !adminOverviewCache.companies);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async (isManual = false) => {
    try {
      const [m, c] = await Promise.all([
        getAdminMetrics(),
        getAdminCompanies({ limit: 10 }),
      ]);
      const validCompanies = Array.isArray(c) ? c : [];
      setMetrics(m);
      setCompanies(validCompanies);

      // Save to in-memory cache
      adminOverviewCache = {
        metrics: m,
        companies: validCompanies,
        timestamp: Date.now(),
      };
    } catch {
      // Handled in api layer
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData(true);
  };

  const totalCompaniesCount =
    metrics?.companies?.total ?? metrics?.totalCompanies ?? companies.length ?? 0;
  const activeCompaniesCount =
    metrics?.companies?.active ??
    metrics?.activeCompanies ??
    companies.filter((c) => c.status === "ACTIVE").length ??
    0;
  const suspendedCompaniesCount =
    metrics?.companies?.suspended ??
    metrics?.suspendedCompanies ??
    companies.filter((c) => c.status === "SUSPENDED").length ??
    0;
  const totalMembersCount =
    metrics?.members?.total ?? metrics?.totalMembers ?? 0;
  const totalJobsCount = metrics?.jobs?.total ?? metrics?.totalJobs ?? 0;
  const pendingActivationsCount =
    metrics?.ownerActivations?.pending ?? metrics?.pendingActivations ?? 0;

  return (
    <>
      <AdminHeader
        title="Super Admin Executive Dashboard"
        subtitle="HireQuest Multi-Tenant Recruitment Ecosystem Overview"
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl font-sans">
        {/* ── Top Bar with Quick Actions ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-linear-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-lg border border-slate-800">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
              Enterprise Tenant Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-medium">
              Monitor client organizations, tenant lifecycles, and system operations.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isRefreshing}
              className="border-white/20 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>

            <Link href="/admin/companies?new=true">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs sm:text-sm px-4 py-2 shadow-md gap-1.5 cursor-pointer transition-all">
                <Plus className="h-4 w-4" />
                Register New Company
              </Button>
            </Link>
          </div>
        </div>

        {/* ── 1. Executive Metric Cards Row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Companies */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Total Organizations
              </span>
              <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Building2 className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900 tracking-tight">
                {loading ? "..." : totalCompaniesCount}
              </p>
              <p className="text-xs text-slate-500 font-semibold flex items-center gap-1 mt-1">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                Across all tenant workspaces
              </p>
            </div>
          </div>

          {/* Card 2: Active Companies */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Active Tenants
              </span>
              <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-black text-slate-900 tracking-tight">
                  {loading ? "..." : activeCompaniesCount}
                </p>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-extrabold">
                  ACTIVE
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-semibold flex items-center gap-1 mt-1">
                {suspendedCompaniesCount} currently suspended
              </p>
            </div>
          </div>

          {/* Card 3: Platform HR & Recruiters */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Total Platform Users
              </span>
              <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900 tracking-tight">
                {loading ? "..." : totalMembersCount}
              </p>
              <p className="text-xs text-indigo-600 font-semibold flex items-center gap-1 mt-1">
                <Users className="h-3.5 w-3.5" />
                Active platform recruiters & members
              </p>
            </div>
          </div>

          {/* Card 4: Pending Owner Activations */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Pending Activations
              </span>
              <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-black text-slate-900 tracking-tight">
                  {loading ? "..." : pendingActivationsCount}
                </p>
                {pendingActivationsCount > 0 && (
                  <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-extrabold">
                    AWAITING SETUP
                  </Badge>
                )}
              </div>
              <p className="text-xs text-amber-700 font-semibold flex items-center gap-1 mt-1">
                Owner invitation tokens pending
              </p>
            </div>
          </div>
        </div>

        {/* ── 2. Client Companies Directory & Recent Activity ── */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Client Organizations & Tenant Status
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Recent onboarding and active company directory.
              </p>
            </div>
            <Link href="/admin/companies">
              <Button
                variant="outline"
                size="sm"
                className="text-xs font-semibold gap-1.5 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl px-4 py-2"
              >
                View All Directory
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center flex flex-col items-center justify-center space-y-2">
              <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
              <p className="text-xs text-slate-500">Fetching organizations...</p>
            </div>
          ) : companies.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {companies.slice(0, 10).map((company) => (
                <div
                  key={company.id}
                  className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0 hover:bg-slate-50/50 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                      {company.name?.slice(0, 2).toUpperCase() || "CO"}
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/admin/companies/${company.id}`}
                        className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors truncate block"
                      >
                        {company.name}
                      </Link>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {company.owner?.email || company.ownerEmail || company.email || company.domain || company.slug || "tenant"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge
                      className={
                        company.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-extrabold text-[10.5px]"
                          : "bg-rose-50 text-rose-700 border-rose-300 font-extrabold text-[10.5px]"
                      }
                    >
                      {company.status || "ACTIVE"}
                    </Badge>
                    <Link href={`/admin/companies/${company.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">No organizations onboarded yet</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Get started by onboarding your first client enterprise tenant.
                </p>
              </div>
              <Link href="/admin/companies?new=true" className="inline-block pt-1">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs gap-1.5 shadow-sm px-4 py-2 cursor-pointer">
                  <Plus className="h-3.5 w-3.5" />
                  Register First Company
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
