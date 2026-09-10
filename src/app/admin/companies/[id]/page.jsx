"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  ArrowLeft,
  Mail,
  User,
  Globe,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  Ban,
  PlayCircle,
  Users,
  Briefcase,
  Loader2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  getAdminCompanyDetails,
  getAdminCompanyStatistics,
  getAdminCompanyOwner,
  toggleCompanyStatus,
  resendOwnerActivation,
  revokeOwnerActivation,
} from "@/lib/api/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminCompanyDetailsPage({ params }) {
  const unwrappedParams = use(params);
  const companyId = unwrappedParams.id;
  const router = useRouter();

  const [company, setCompany] = useState(null);
  const [stats, setStats] = useState(null);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCompanyData = async () => {
    try {
      const [c, s, o] = await Promise.all([
        getAdminCompanyDetails(companyId),
        getAdminCompanyStatistics(companyId),
        getAdminCompanyOwner(companyId),
      ]);
      setCompany(c);
      setStats(s);
      setOwner(o);
    } catch {
      toast.error("Failed to load company details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchCompanyData();
    }
  }, [companyId]);

  const handleToggleStatus = async () => {
    if (!company) return;
    const newStatus = company.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setActionLoading(true);
    try {
      await toggleCompanyStatus(company.id, newStatus);
      toast.success(`${company.name} is now ${newStatus}`);
      setCompany((prev) => ({ ...prev, status: newStatus }));
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResendActivation = async () => {
    setActionLoading(true);
    try {
      await resendOwnerActivation(companyId);
      toast.success("Owner activation email has been queued and sent.");
      fetchCompanyData();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to resend activation link.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeActivation = async () => {
    setActionLoading(true);
    try {
      await revokeOwnerActivation(companyId);
      toast.success("Pending owner activation has been revoked.");
      fetchCompanyData();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to revoke activation.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <AdminHeader title="Company Organization" subtitle="Loading tenant information..." />
        <div className="p-16 text-center flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Fetching company details & statistics...</p>
        </div>
      </>
    );
  }

  if (!company) {
    return (
      <>
        <AdminHeader title="Company Organization" subtitle="Organization not found" />
        <div className="p-16 text-center space-y-4">
          <Building2 className="h-12 w-12 text-slate-300 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Organization Not Found</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            The requested client organization could not be found or may have been deleted.
          </p>
          <Link href="/admin/companies">
            <Button variant="outline" size="sm" className="rounded-xl">
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Directory
            </Button>
          </Link>
        </div>
      </>
    );
  }

  const isOwnerActive =
    owner?.status === "ACTIVE" ||
    owner?.owner?.status === "ACTIVE" ||
    stats?.ownerActivation === null ||
    stats?.ownerActivation?.status === "ACTIVATED";

  return (
    <>
      <AdminHeader
        title={company.name || "Company Overview"}
        subtitle={`Tenant ID: ${company.id}`}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl font-sans">
        {/* ── Navigation Breadcrumb ── */}
        <div>
          <Link
            href="/admin/companies"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Organizations Directory</span>
          </Link>
        </div>

        {/* ── 1. Header Card: Company Branding & Status Controls ── */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-slate-900 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-md">
              {company.logo || company.name?.slice(0, 2).toUpperCase() || "CO"}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {company.name}
                </h1>
                <Badge
                  className={
                    company.status === "ACTIVE"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-extrabold text-xs"
                      : "bg-rose-50 text-rose-700 border-rose-300 font-extrabold text-xs"
                  }
                >
                  {company.status || "ACTIVE"}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                {company.domain && (
                  <span className="flex items-center gap-1 font-medium">
                    <Globe className="h-3.5 w-3.5 text-slate-400" />
                    {company.domain}
                  </span>
                )}
                {company.slug && (
                  <span className="text-slate-400">
                    Slug: <strong>{company.slug}</strong>
                  </span>
                )}
                {company.createdAt && (
                  <span className="text-slate-400">
                    Onboarded: {new Date(company.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleToggleStatus}
              disabled={actionLoading}
              variant="outline"
              className={`h-11 px-4 font-bold text-xs rounded-xl gap-2 cursor-pointer ${
                company.status === "ACTIVE"
                  ? "border-rose-200 text-rose-600 hover:bg-rose-50"
                  : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
              }`}
            >
              {company.status === "ACTIVE" ? (
                <>
                  <Ban className="h-4 w-4" />
                  <span>Suspend Organization</span>
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4" />
                  <span>Activate Organization</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* ── 2. Two-Column Grid: Owner Details & Live Metrics ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Organization Owner Details Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">Assigned Organization Owner</h2>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Account Status
                  </span>
                  <Badge
                    className={
                      isOwnerActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-extrabold text-[10.5px]"
                        : "bg-amber-50 text-amber-700 border-amber-200 font-extrabold text-[10.5px]"
                    }
                  >
                    {isOwnerActive ? "ACTIVATED" : "PENDING ACTIVATION"}
                  </Badge>
                </div>

                <div className="space-y-1 pt-1">
                  <p className="text-sm font-bold text-slate-900">
                    {owner?.name || owner?.owner?.name || company?.ownerName || "Assigned Owner"}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    {owner?.email || owner?.owner?.email || company?.ownerEmail || company?.email || "No email"}
                  </p>
                </div>
              </div>

              {/* Owner Action Buttons */}
              <div className="space-y-2 pt-1">
                <Button
                  onClick={handleResendActivation}
                  disabled={actionLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 rounded-xl gap-2 cursor-pointer shadow-xs"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Resend Activation Link</span>
                </Button>

                {!isOwnerActive && (
                  <Button
                    onClick={handleRevokeActivation}
                    disabled={actionLoading}
                    variant="outline"
                    className="w-full border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs h-10 rounded-xl gap-2 cursor-pointer"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Revoke Pending Token</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Live Organization Statistics */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Stat 1: Members */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Team Members
                  </span>
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-2xl font-black text-slate-900">
                  {stats?.members?.total ?? 0}
                </p>
                <p className="text-[11px] text-slate-500">
                  {stats?.members?.active ?? 0} active HR recruiters
                </p>
              </div>

              {/* Stat 2: Active Job Roles */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Job Openings
                  </span>
                  <Briefcase className="h-4 w-4 text-indigo-600" />
                </div>
                <p className="text-2xl font-black text-slate-900">
                  {stats?.jobs?.total ?? 0}
                </p>
                <p className="text-[11px] text-slate-500">
                  {stats?.jobs?.active ?? 0} published assessments
                </p>
              </div>

              {/* Stat 3: Pending Invitations */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Candidate Invites
                  </span>
                  <Clock className="h-4 w-4 text-amber-600" />
                </div>
                <p className="text-2xl font-black text-slate-900">
                  {stats?.invitations?.pending ?? 0}
                </p>
                <p className="text-[11px] text-slate-500">
                  Pending test completions
                </p>
              </div>
            </div>

            {/* Tenant Overview Metadata Card */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Tenant Metadata & Configuration</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 space-y-1">
                  <span className="text-slate-500 font-medium">Subscription Tier</span>
                  <p className="font-bold text-slate-900">{company.plan || "Enterprise Plan"}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 space-y-1">
                  <span className="text-slate-500 font-medium">Workspace Domain</span>
                  <p className="font-bold text-slate-900">{company.domain || "Standard Tenant"}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 space-y-1">
                  <span className="text-slate-500 font-medium">Database Identifier</span>
                  <p className="font-mono text-[11px] text-slate-800">{company.id}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 space-y-1">
                  <span className="text-slate-500 font-medium">Platform Isolation</span>
                  <p className="font-bold text-emerald-600">Multi-Tenant Tenant-Isolated</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
