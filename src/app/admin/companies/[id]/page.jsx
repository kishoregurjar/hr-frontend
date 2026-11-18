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
  Crown,
  Phone,
  MapPin,
  Calendar,
  UserCheck,
  Sliders,
  Sparkles,
  Gauge,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  getAdminCompanyDetails,
  getAdminCompanyStatistics,
  getAdminCompanyOwner,
  getAdminPlans,
  toggleCompanyStatus,
  updateCompanyPlan,
  resendOwnerActivation,
  revokeOwnerActivation,
} from "@/lib/api/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

function formatSubscriptionDate(dateString) {
  if (!dateString) return "Not Available";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Not Available";

  const formatted = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);

  return formatted.replace(/([ap]m)$/i, (m) => m.toUpperCase());
}

export default function AdminCompanyDetailsPage({ params }) {
  const unwrappedParams = use(params);
  const companyId = unwrappedParams.id;
  const router = useRouter();

  const [company, setCompany] = useState(null);
  const [stats, setStats] = useState(null);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Plan Management Modal State
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState("STARTER");
  const [selectedPlanStatus, setSelectedPlanStatus] = useState("ACTIVE");
  const [customSeatLimit, setCustomSeatLimit] = useState("");
  const [customCandidateLimit, setCustomCandidateLimit] = useState("");
  const [customInviteLimit, setCustomInviteLimit] = useState("");
  const [planSaving, setPlanSaving] = useState(false);

  useEffect(() => {
    if (company) {
      setSelectedPlan(company.plan || "STARTER");
      setSelectedPlanStatus(company.planStatus || "ACTIVE");
      setCustomSeatLimit(company.customSeatLimit !== null && company.customSeatLimit !== undefined ? company.customSeatLimit : "");
      setCustomCandidateLimit(company.customCandidateLimit !== null && company.customCandidateLimit !== undefined ? company.customCandidateLimit : "");
      setCustomInviteLimit(company.customInviteLimit !== null && company.customInviteLimit !== undefined ? company.customInviteLimit : "");
    }
  }, [company]);

  const handleOpenPlanModal = async () => {
    if (company) {
      setSelectedPlan(company.plan || "STARTER");
      setSelectedPlanStatus(company.planStatus || "ACTIVE");
      setCustomSeatLimit(company.customSeatLimit !== null && company.customSeatLimit !== undefined ? company.customSeatLimit : "");
      setCustomCandidateLimit(company.customCandidateLimit !== null && company.customCandidateLimit !== undefined ? company.customCandidateLimit : "");
      setCustomInviteLimit(company.customInviteLimit !== null && company.customInviteLimit !== undefined ? company.customInviteLimit : "");
    }
    setIsPlanModalOpen(true);
    if (!plans || plans.length === 0) {
      const pList = await getAdminPlans().catch(() => []);
      if (Array.isArray(pList) && pList.length > 0) {
        setPlans(pList);
      }
    }
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    setPlanSaving(true);
    try {
      await updateCompanyPlan(company.id, {
        plan: selectedPlan,
        planStatus: selectedPlanStatus,
        customSeatLimit: selectedPlan === "ENTERPRISE" && customSeatLimit !== "" ? parseInt(customSeatLimit, 10) : null,
        customCandidateLimit: selectedPlan === "ENTERPRISE" && customCandidateLimit !== "" ? parseInt(customCandidateLimit, 10) : null,
        customInviteLimit: selectedPlan === "ENTERPRISE" && customInviteLimit !== "" ? parseInt(customInviteLimit, 10) : null,
      });
      toast.success(`Subscription plan updated to ${selectedPlan} successfully`);
      setIsPlanModalOpen(false);
      fetchCompanyData();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update subscription plan.");
    } finally {
      setPlanSaving(false);
    }
  };

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

  const totalMembers =
    stats?.members?.total ??
    stats?.statistics?.members?.total ??
    company?.members?.length ??
    0;

  const activeMembers =
    stats?.members?.active ??
    stats?.statistics?.members?.active ??
    company?.members?.filter((m) => m.user?.status === "ACTIVE").length ??
    0;

  const pendingInvitations =
    stats?.invitations?.pending ??
    stats?.statistics?.invitations?.pending ??
    company?._count?.invitations ??
    0;

  const membersList = company?.members || [];
  const invitationsList = company?.invitations || [];

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
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={company.name}
                  className="h-full w-full object-cover rounded-2xl"
                />
              ) : (
                company.name?.slice(0, 2).toUpperCase() || "CO"
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {company.name}
                </h1>
                <Badge
                  className={
                    company.status === "SUSPENDED"
                      ? "bg-rose-50 text-rose-700 border-rose-300 font-extrabold text-xs"
                      : !isOwnerActive
                      ? "bg-amber-50 text-amber-700 border-amber-300 font-extrabold text-xs"
                      : "bg-emerald-50 text-emerald-700 border-emerald-300 font-extrabold text-xs"
                  }
                >
                  {company.status === "SUSPENDED"
                    ? "SUSPENDED"
                    : !isOwnerActive
                    ? "PENDING ACTIVATION"
                    : "ACTIVE"}
                </Badge>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap pt-1">
                <Badge
                  variant="outline"
                  className={`text-[10.5px] font-bold ${
                    company.customDomain || company.domainMode === "CUSTOM_DOMAIN"
                      ? "border-indigo-200 text-indigo-700 bg-indigo-50/70"
                      : "border-blue-200 text-blue-700 bg-blue-50/70"
                  }`}
                >
                  {company.customDomain || company.domainMode === "CUSTOM_DOMAIN"
                    ? "Custom Domain"
                    : "HireQuest Subdomain"}
                </Badge>

                {company.customDomain && (
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold ${
                      company.customDomainVerified
                        ? "border-emerald-200 text-emerald-700 bg-emerald-50"
                        : "border-amber-200 text-amber-700 bg-amber-50"
                    }`}
                  >
                    {company.customDomainVerified ? "Verified" : "Pending DNS Verification"}
                  </Badge>
                )}

                {(company.website || company.domain) && (
                  <a
                    href={company.website || `https://${company.domain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 font-medium hover:text-blue-600 transition-colors"
                  >
                    <Globe className="h-3.5 w-3.5 text-slate-400" />
                    {company.domain || company.website}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}

                <span className="text-slate-400 font-mono text-xs">
                  {company.customDomain ? company.customDomain : `${company.slug}.hirequest.com`}
                </span>

                <a
                  href={
                    company.localPreviewUrl ||
                    (company.customDomain
                      ? `http://${company.customDomain.split(".")[0]}.localhost:3000`
                      : `http://${company.slug}.localhost:3000`)
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:underline font-semibold text-xs"
                >
                  <span>Open Local Portal</span>
                  <ExternalLink className="h-3 w-3" />
                </a>

                {company.slug && (
                  <span className="text-slate-400">
                    Slug: <strong className="font-mono text-slate-700">{company.slug}</strong>
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

        {/* ── 2. SaaS Subscription Plan & Usage Quotas ── */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <Crown className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Subscription Plan & Quotas
                </h2>
                <Badge
                  className={`font-black text-xs px-2.5 py-0.5 ${
                    company.plan === "DEMO"
                      ? "bg-purple-50 text-purple-700 border-purple-200"
                      : company.plan === "GROWTH"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : company.plan === "BUSINESS"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : company.plan === "ENTERPRISE"
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                      : "bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  {company.plan || "STARTER"}
                </Badge>
                <Badge
                  className={`font-black text-xs px-2.5 py-0.5 ${
                    company.planStatus === "ACTIVE"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                      : "bg-rose-50 text-rose-700 border-rose-300"
                  }`}
                >
                  {company.planStatus || "ACTIVE"}
                </Badge>
              </div>
              <p className="text-xs text-slate-500">
                All companies have identical product feature access. Usage is strictly bounded by active seats, lifetime candidates, and monthly assessment invitations.
              </p>
            </div>

            <Button
              onClick={handleOpenPlanModal}
              variant="outline"
              className="h-10 px-4 font-bold text-xs rounded-xl gap-2 border-slate-200 hover:bg-slate-50 text-slate-700 shadow-2xs shrink-0 cursor-pointer"
            >
              <Sliders className="h-4 w-4 text-slate-500" />
              <span>Change Subscription Plan</span>
            </Button>
          </div>

          {/* ── Subscription Validity & Period Details Row ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-blue-500" />
                Plan Start Date
              </span>
              <p className="text-sm font-bold text-slate-900 font-mono">
                {formatSubscriptionDate(company.activeSubscription?.startDate || company.planStartedAt)}
              </p>
              <p className="text-[10.5px] text-slate-400">
                Subscription activation timestamp
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-indigo-500" />
                Plan End Date
              </span>
              <p className="text-sm font-bold text-slate-900 font-mono">
                {formatSubscriptionDate(company.activeSubscription?.endDate || company.planExpiresAt)}
              </p>
              <p className="text-[10.5px] text-slate-400">
                {company.planExpiresAt || company.activeSubscription?.endDate
                  ? "Scheduled expiration timestamp"
                  : "No expiration set"}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-emerald-500" />
                Billing Cycle
              </span>
              <p className="text-sm font-bold text-slate-900 capitalize">
                {company.activeSubscription?.billingCycle
                  ? `${company.activeSubscription.billingCycle.toLowerCase()}`
                  : company.plan === "DEMO"
                  ? "30-Day Trial"
                  : "Standard"}
              </p>
              <p className="text-[10.5px] text-slate-400">
                {company.activeSubscription?.amount !== undefined && company.activeSubscription?.amount !== null
                  ? Number(company.activeSubscription.amount) === 0
                    ? "Free Tier / Trial"
                    : `₹${Number(company.activeSubscription.amount).toLocaleString("en-IN")} billed`
                  : "Platform default"}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-purple-500" />
                Plan Status
              </span>
              <div className="flex items-center gap-2 pt-0.5">
                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                    company.planStatus === "ACTIVE"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${company.planStatus === "ACTIVE" ? "bg-emerald-600" : "bg-rose-600"}`} />
                  {company.planStatus || "ACTIVE"}
                </span>
                {company.activeSubscription?.isTrial && (
                  <Badge variant="outline" className="text-[10px] font-semibold bg-amber-50 text-amber-800 border-amber-300">
                    Trial
                  </Badge>
                )}
              </div>
              <p className="text-[10.5px] text-slate-400">
                Enforced subscription status
              </p>
            </div>
          </div>

          {/* Demo Countdown Alert if on DEMO plan */}
          {company.plan === "DEMO" && (
            <div className="rounded-2xl border border-purple-200 bg-purple-50/80 p-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-purple-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-purple-900">
                    30-Day Fixed Duration Demo Trial
                  </p>
                  <p className="text-[11px] text-purple-700">
                    {company.demoRemaining?.formatted || "30-day trial active from initial plan assignment."}
                  </p>
                </div>
              </div>
              {company.planExpiresAt && (
                <span className="text-xs font-mono font-semibold text-purple-900">
                  Expires: {new Date(company.planExpiresAt).toLocaleString()}
                </span>
              )}
            </div>
          )}

          {/* 3 Quota Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Active HR Seats */}
            <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Active HR Seats
                </span>
                <span className="text-xs font-mono font-bold text-blue-600">
                  {company.usage?.hrSeats?.used ?? 0} / {company.usage?.hrSeats?.limit !== null && company.usage?.hrSeats?.limit !== undefined ? company.usage.hrSeats.limit : "Unlimited"}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-black text-slate-900">
                  {company.usage?.hrSeats?.used ?? 0}
                  <span className="text-xs font-semibold text-slate-400 ml-1.5">
                    / {company.usage?.hrSeats?.limit !== null && company.usage?.hrSeats?.limit !== undefined ? company.usage.hrSeats.limit : "∞"} allowed
                  </span>
                </p>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: company.usage?.hrSeats?.limit
                        ? `${Math.min(100, ((company.usage?.hrSeats?.used ?? 0) / company.usage.hrSeats.limit) * 100)}%`
                        : "20%",
                    }}
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Consolidated count of active <strong>ADMIN</strong> and <strong>RECRUITER</strong> members. <em>OWNER</em> does not consume a seat.
              </p>
            </div>

            {/* 2. Lifetime Candidates */}
            <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Lifetime Unique Candidates
                </span>
                <span className="text-xs font-mono font-bold text-emerald-600">
                  {company.usage?.candidates?.used ?? 0} / {company.usage?.candidates?.limit !== null && company.usage?.candidates?.limit !== undefined ? company.usage.candidates.limit : "Unlimited"}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-black text-slate-900">
                  {company.usage?.candidates?.used ?? 0}
                  <span className="text-xs font-semibold text-slate-400 ml-1.5">
                    / {company.usage?.candidates?.limit !== null && company.usage?.candidates?.limit !== undefined ? company.usage.candidates.limit : "∞"} allowed
                  </span>
                </p>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all"
                    style={{
                      width: company.usage?.candidates?.limit
                        ? `${Math.min(100, ((company.usage?.candidates?.used ?? 0) / company.usage.candidates.limit) * 100)}%`
                        : "20%",
                    }}
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Cumulative unique candidates added via manual entry, mailbox resume ingestion, or direct assessment invites.
              </p>
            </div>

            {/* 3. Monthly Assessment Invitations */}
            <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Monthly Invitations
                </span>
                <span className="text-xs font-mono font-bold text-amber-600">
                  {company.usage?.invitations?.used ?? 0} / {company.usage?.invitations?.limit !== null && company.usage?.invitations?.limit !== undefined ? company.usage.invitations.limit : "Unlimited"}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-black text-slate-900">
                  {company.usage?.invitations?.used ?? 0}
                  <span className="text-xs font-semibold text-slate-400 ml-1.5">
                    / {company.usage?.invitations?.limit !== null && company.usage?.invitations?.limit !== undefined ? company.usage.invitations.limit : "∞"} this month
                  </span>
                </p>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all"
                    style={{
                      width: company.usage?.invitations?.limit
                        ? `${Math.min(100, ((company.usage?.invitations?.used ?? 0) / company.usage.invitations.limit) * 100)}%`
                        : "20%",
                    }}
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Dispatched individual & bulk assessment invitations in current calendar month. Resets automatically on 1st of month.
              </p>
            </div>
          </div>
        </div>

        {/* ── 3. Two-Column Grid: Owner Details & Live Metrics ── */}
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

          {/* Right Column: Live Organization Statistics & Metadata */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stat: Workspace Team Members */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Workspace Team Members
                </span>
                <div className="flex items-baseline gap-3">
                  <p className="text-3xl font-black text-slate-900">
                    {totalMembers}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    {activeMembers} active workspace {activeMembers === 1 ? "member" : "members"}
                  </p>
                </div>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Users className="h-6 w-6" />
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
                  <p className="font-bold text-slate-900">{company.domain || company.customDomain || (company.slug ? `${company.slug}.hirequest.app` : "Standard Tenant")}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 space-y-1">
                  <span className="text-slate-500 font-medium">Database Identifier</span>
                  <p className="font-mono text-[11px] text-slate-800 break-all">{company.id}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 space-y-1">
                  <span className="text-slate-500 font-medium">Platform Isolation</span>
                  <p className="font-bold text-emerald-600">Multi-Tenant Tenant-Isolated</p>
                </div>
                {company.industry && (
                  <div className="p-3 rounded-xl bg-slate-50 space-y-1">
                    <span className="text-slate-500 font-medium">Industry</span>
                    <p className="font-bold text-slate-900">{company.industry}</p>
                  </div>
                )}
                {company.phone && (
                  <div className="p-3 rounded-xl bg-slate-50 space-y-1">
                    <span className="text-slate-500 font-medium">Contact Phone</span>
                    <p className="font-bold text-slate-900">{company.phone}</p>
                  </div>
                )}
                {(company.city || company.country || company.address) && (
                  <div className="p-3 rounded-xl bg-slate-50 space-y-1 sm:col-span-2">
                    <span className="text-slate-500 font-medium">Office Location</span>
                    <p className="font-bold text-slate-900">
                      {[company.address, company.city, company.country].filter(Boolean).join(", ")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. Workspace Team Members & Recruiters Table ── */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-bold text-slate-900">
                  Workspace Team Members
                </h2>
                <Badge className="bg-slate-100 text-slate-700 font-bold text-xs ml-1">
                  {membersList.length}
                </Badge>
              </div>
              <p className="text-xs text-slate-500">
                All registered owners, HR managers, and recruiters belonging to this organization workspace.
              </p>
            </div>
          </div>

          {membersList.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 space-y-3">
              <Users className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No Team Members Found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No active team members or recruiters are currently recorded for this tenant.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">Member</th>
                    <th scope="col" className="px-6 py-3.5">Email</th>
                    <th scope="col" className="px-6 py-3.5">Workspace Role</th>
                    <th scope="col" className="px-6 py-3.5">Account Status</th>
                    <th scope="col" className="px-6 py-3.5">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {membersList.map((m) => {
                    const memberName = m.user?.name || m.user?.email?.split("@")[0] || "Team Member";
                    const memberEmail = m.user?.email || "—";
                    const memberRole = (m.role || "MEMBER").toUpperCase();
                    const memberStatus = (m.user?.status || "ACTIVE").toUpperCase();
                    const initials = memberName.slice(0, 2).toUpperCase();

                    return (
                      <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {initials}
                            </div>
                            <span className="font-bold text-slate-900">
                              {memberName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-600 font-mono text-[11.5px]">
                            {memberEmail}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {memberRole === "OWNER" ? (
                            <Badge className="bg-purple-50 text-purple-700 border-purple-200 font-extrabold text-[10.5px] gap-1">
                              <Crown className="h-3 w-3" />
                              OWNER
                            </Badge>
                          ) : memberRole === "RECRUITER" ? (
                            <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-extrabold text-[10.5px]">
                              RECRUITER
                            </Badge>
                          ) : (
                            <Badge className="bg-slate-100 text-slate-700 border-slate-200 font-extrabold text-[10.5px]">
                              {memberRole}
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            className={
                              memberStatus === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-extrabold text-[10.5px]"
                                : memberStatus === "INVITED"
                                ? "bg-amber-50 text-amber-700 border-amber-200 font-extrabold text-[10.5px]"
                                : "bg-rose-50 text-rose-700 border-rose-200 font-extrabold text-[10.5px]"
                            }
                          >
                            {memberStatus}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pending Invitations Sub-table (if any invitations exist) */}
          {invitationsList.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Pending Recruiter Invitations ({invitationsList.length})
                </h3>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
                    <tr>
                      <th scope="col" className="px-6 py-3">Invited Email</th>
                      <th scope="col" className="px-6 py-3">Invited Role</th>
                      <th scope="col" className="px-6 py-3">Invitation Status</th>
                      <th scope="col" className="px-6 py-3">Sent Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {invitationsList.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-3 font-mono font-medium text-slate-900">
                          {inv.email}
                        </td>
                        <td className="px-6 py-3">
                          <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-bold text-[10.5px]">
                            {inv.role || "RECRUITER"}
                          </Badge>
                        </td>
                        <td className="px-6 py-3">
                          <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-bold text-[10.5px]">
                            {inv.status || "PENDING"}
                          </Badge>
                        </td>
                        <td className="px-6 py-3 text-slate-500">
                          {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ── Change Subscription Plan Dialog ── */}
        <Dialog open={isPlanModalOpen} onOpenChange={setIsPlanModalOpen}>
          <DialogContent className="w-[94vw] sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 font-sans border border-slate-200/90 shadow-2xl">
            <DialogHeader className="space-y-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Crown className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-black text-slate-900">
                    Change Subscription Plan
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500">
                    Configure company subscription tier and quota allowances.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleSavePlan} className="space-y-5 pt-2">
              {/* Plan Tier Selection */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Select Plan Tier <span className="text-rose-500 font-black">*</span>
                </Label>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
                >
                  {plans && plans.length > 0 ? (
                    plans.map((p) => {
                      const isEnterprise = p.code === "ENTERPRISE" || p.isCustom;
                      const isDemo = p.code === "DEMO" || p.isTrial;
                      let label = p.name;

                      if (isEnterprise) {
                        label = `${p.name} (Custom Quotas configured below)`;
                      } else if (isDemo) {
                        const trialDays = p.durationDays || 30;
                        const seatPart = p.seatLimit ? `${p.seatLimit} HR seats` : "Unlimited HR seats";
                        const candPart = p.candidateLimit ? `${p.candidateLimit} candidates` : "Unlimited candidates";
                        const invitePart = p.inviteLimit ? `${p.inviteLimit} invites/mo` : "Unlimited invites/mo";
                        label = `${p.name} (${trialDays}-day trial: ${seatPart}, ${candPart}, ${invitePart})`;
                      } else {
                        const seatPart = p.seatLimit !== null ? `${p.seatLimit} HR seats` : "Unlimited seats";
                        const candPart = p.candidateLimit !== null ? `${p.candidateLimit.toLocaleString("en-IN")} candidates` : "Unlimited candidates";
                        const invitePart = p.inviteLimit !== null ? `${p.inviteLimit.toLocaleString("en-IN")} invites/mo` : "Unlimited invites";
                        label = `${p.name} (${seatPart}, ${candPart}, ${invitePart})`;
                      }

                      return (
                        <option key={p.id || p.code} value={p.code}>
                          {label}
                        </option>
                      );
                    })
                  ) : (
                    <>
                      <option value="DEMO">Demo (30-day trial: Unlimited HR seats, Unlimited candidates, Unlimited invites/mo)</option>
                      <option value="STARTER">Starter (2 HR seats, 200 candidates, 50 invites/mo)</option>
                      <option value="GROWTH">Growth (5 HR seats, 1,000 candidates, 300 invites/mo)</option>
                      <option value="BUSINESS">Business (15 HR seats, 5,000 candidates, 1,000 invites/mo)</option>
                      <option value="ENTERPRISE">Enterprise (Custom Quotas configured below)</option>
                    </>
                  )}
                </select>
              </div>

              {/* Enterprise Custom Quotas Fields */}
              {selectedPlan === "ENTERPRISE" && (
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-900 text-xs font-bold">
                    <Sliders className="h-4 w-4 text-indigo-600" />
                    <span>Configure Enterprise Custom Limits</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-slate-600">
                        HR Seats Limit
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="e.g. 50"
                        value={customSeatLimit}
                        onChange={(e) => setCustomSeatLimit(e.target.value)}
                        className="h-10 rounded-xl text-xs bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-slate-600">
                        Candidates Limit
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="e.g. 25000"
                        value={customCandidateLimit}
                        onChange={(e) => setCustomCandidateLimit(e.target.value)}
                        className="h-10 rounded-xl text-xs bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-slate-600">
                        Monthly Invites
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="e.g. 5000"
                        value={customInviteLimit}
                        onChange={(e) => setCustomInviteLimit(e.target.value)}
                        className="h-10 rounded-xl text-xs bg-white"
                      />
                    </div>
                  </div>
                  <p className="text-[10.5px] text-indigo-700">
                    Leave any quota blank to grant unlimited capacity for that resource.
                  </p>
                </div>
              )}

              {/* Plan Status */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Plan Status
                </Label>
                <select
                  value={selectedPlanStatus}
                  onChange={(e) => setSelectedPlanStatus(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
                >
                  <option value="ACTIVE">ACTIVE (Workspace access enabled)</option>
                  <option value="EXPIRED">EXPIRED (Blocks member logins and API actions)</option>
                  <option value="CANCELLED">CANCELLED (Subscription discontinued)</option>
                </select>
              </div>

              {selectedPlan === "DEMO" && (
                <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-start gap-2.5">
                  <Clock className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>
                    Assigning the Demo plan will automatically set a fixed 30-day expiration countdown (720 hours from now). When expired, company access will be automatically blocked.
                  </span>
                </div>
              )}

              <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPlanModalOpen(false)}
                  disabled={planSaving}
                  className="h-10 px-4 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={planSaving}
                  className="h-10 px-5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-xs gap-2"
                >
                  {planSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Save Plan Changes</span>
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
}
