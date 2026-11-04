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
                    company.status === "ACTIVE"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-extrabold text-xs"
                      : "bg-rose-50 text-rose-700 border-rose-300 font-extrabold text-xs"
                  }
                >
                  {company.status || "ACTIVE"}
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
      </main>
    </>
  );
}
