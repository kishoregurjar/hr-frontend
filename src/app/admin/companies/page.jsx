"use client";

import { useState, useEffect, Suspense } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Search,
  CheckCircle2,
  XCircle,
  Plus,
  Shield,
  ExternalLink,
  Users,
  Mail,
  User,
  Globe,
  Loader2,
  RefreshCw,
  MoreVertical,
  Eye,
  Send,
  Ban,
  PlayCircle,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  getAdminCompanies,
  toggleCompanyStatus,
  createAdminCompany,
  resendOwnerActivation,
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
} from "@/components/ui/dialog";

// Module-level in-memory cache for instant navigation (Stale-While-Revalidate)
let adminCompaniesCache = {
  companies: null,
  timestamp: 0,
};

function AdminCompaniesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoOpenNewModal = searchParams.get("new") === "true";

  const [companies, setCompanies] = useState(adminCompaniesCache.companies || []);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(!adminCompaniesCache.companies);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  // Close dropdown on click outside, scroll, or resize
  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (!e.target.closest(".actions-menu-portal") && !e.target.closest(".actions-menu-trigger")) {
        setActiveMenu(null);
      }
    };
    const handleScrollOrResize = () => {
      setActiveMenu(null);
    };
    document.addEventListener("mousedown", handleGlobalClick);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      document.removeEventListener("mousedown", handleGlobalClick);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, []);

  // Register New Company Modal State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(autoOpenNewModal);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [companyForm, setCompanyForm] = useState({
    name: "",
    domainMode: "SUBDOMAIN",
    customDomain: "",
    domain: "",
    website: "",
    ownerName: "",
    ownerEmail: "",
    plan: "Enterprise",
  });

  const slugPreview = companyForm.name
    ? companyForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    : "company";

  const customDomainClean = companyForm.customDomain
    ? companyForm.customDomain.replace(/^https?:\/\//, "").replace(/[:\/].*$/, "").toLowerCase().trim()
    : "";

  const customDomainPrefix = customDomainClean.split(".")[0] || "company";

  const fetchCompanies = async () => {
    try {
      const data = await getAdminCompanies();
      const validData = Array.isArray(data) ? data : [];
      setCompanies(validData);
      adminCompaniesCache = {
        companies: validData,
        timestamp: Date.now(),
      };
    } catch {
      toast.error("Failed to load company organizations.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchCompanies();
  };

  const handleToggleStatus = async (company) => {
    const newStatus = company.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setActionLoadingId(company.id);
    try {
      await toggleCompanyStatus(company.id, newStatus);
      toast.success(`${company.name} is now ${newStatus}`);
      setCompanies((prev) =>
        prev.map((c) => (c.id === company.id ? { ...c, status: newStatus } : c))
      );
    } catch {
      toast.error("Failed to update organization status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleResendActivation = async (company) => {
    setActionLoadingId(company.id);
    try {
      await resendOwnerActivation(company.id);
      toast.success(`Owner activation email sent to ${company.ownerEmail || company.email || "owner"}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to resend activation email.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRegisterCompany = async (e) => {
    e.preventDefault();

    if (!companyForm.name.trim() || !companyForm.ownerEmail.trim()) {
      toast.error("Company Name and Owner Email are required.");
      return;
    }

    if (companyForm.domainMode === "CUSTOM_DOMAIN") {
      const cleanDomain = (companyForm.customDomain || "").trim();
      if (!cleanDomain) {
        toast.error("Please enter a custom domain (e.g. facebookcompany.com).");
        return;
      }
      if (!cleanDomain.includes(".")) {
        toast.error("Please enter a valid domain format (e.g. company.com).");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await createAdminCompany({
        companyName: companyForm.name.trim(),
        domainMode: companyForm.domainMode,
        customDomain: companyForm.domainMode === "CUSTOM_DOMAIN" ? companyForm.customDomain.trim() : undefined,
        domain: companyForm.domainMode === "CUSTOM_DOMAIN" ? companyForm.customDomain.trim() : undefined,
        website: companyForm.website?.trim() || undefined,
        ownerName: companyForm.ownerName.trim() || undefined,
        ownerEmail: companyForm.ownerEmail.trim(),
        plan: companyForm.plan || "Enterprise",
      });

      toast.success("Organization created successfully! Welcome & activation email dispatched.");
      setIsRegisterModalOpen(false);
      setCompanyForm({
        name: "",
        domainMode: "SUBDOMAIN",
        customDomain: "",
        domain: "",
        website: "",
        ownerName: "",
        ownerEmail: "",
        plan: "Enterprise",
      });
      fetchCompanies();
    } catch (err) {
      toast.error(err?.message || "Failed to register organization.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered List
  const filteredCompanies = companies.filter((c) => {
    const matchesSearch =
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.domain?.toLowerCase().includes(search.toLowerCase()) ||
      c.ownerEmail?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.slug?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ? true : c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <AdminHeader
        title="Organization & Tenant Directory"
        subtitle="Manage B2B Enterprise Client Accounts & Owner Activations"
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl font-sans">
        {/* ── 1. Top Controls Bar: Search, Status Tabs, Register Action ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/80 w-fit">
            {["ALL", "ACTIVE", "SUSPENDED"].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === tab
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab === "ALL" ? "All Organizations" : tab === "ACTIVE" ? "Active" : "Suspended"}
                <span className="ml-1.5 text-[10px] opacity-60">
                  (
                  {tab === "ALL"
                    ? companies.length
                    : companies.filter((c) => c.status === tab).length}
                  )
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, domain..."
                className="pl-9 pr-4 h-10 rounded-xl bg-white border-slate-200 text-xs"
              />
            </div>

            <Button
              onClick={handleRefresh}
              variant="outline"
              size="icon"
              disabled={isRefreshing}
              className="h-10 w-10 shrink-0 border-slate-200 rounded-xl cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>

            <Button
              onClick={() => setIsRegisterModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-md gap-2 shrink-0 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Register Company</span>
            </Button>
          </div>
        </div>

        {/* ── 2. Companies Data Table ── */}
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-16 text-center flex flex-col items-center justify-center space-y-3">
              <Loader2 className="h-7 w-7 text-blue-600 animate-spin" />
              <p className="text-xs font-semibold text-slate-500">Loading organizations...</p>
            </div>
          ) : filteredCompanies.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-5">Organization</th>
                    <th className="py-3.5 px-4">Owner & Contact</th>
                    <th className="py-3.5 px-4">Domain / Slug</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Created Date</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredCompanies.map((company) => (
                    <tr key={company.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Company Name & Logo */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {company.name?.slice(0, 2).toUpperCase() || "CO"}
                          </div>
                          <div>
                            <Link
                              href={`/admin/companies/${company.id}`}
                              className="font-bold text-slate-900 hover:text-blue-600 transition-colors block"
                            >
                              {company.name}
                            </Link>
                            <span className="text-[11px] text-slate-400 font-medium">
                              ID: {company.id?.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Owner Info */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-800">
                            {company.ownerName || company.owner?.name || "Assigned Owner"}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {company.ownerEmail || company.email || company.owner?.email || "No email"}
                          </p>
                        </div>
                      </td>

                      {/* Domain & Routing */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-bold ${
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
                                className={`text-[9.5px] font-semibold ${
                                  company.customDomainVerified
                                    ? "border-emerald-200 text-emerald-700 bg-emerald-50"
                                    : "border-amber-200 text-amber-700 bg-amber-50"
                                }`}
                              >
                                {company.customDomainVerified ? "Verified" : "Pending DNS"}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <a
                              href={
                                company.localPreviewUrl ||
                                (company.customDomain
                                  ? `http://${company.customDomain.split(".")[0]}.localhost:3000`
                                  : `http://${company.slug}.localhost:3000`)
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="font-mono text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors inline-flex items-center gap-1"
                            >
                              <span>
                                {company.customDomain
                                  ? company.customDomain
                                  : `${company.slug}.hirequest.com`}
                              </span>
                              <ExternalLink className="h-3 w-3 text-slate-400 inline" />
                            </a>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <Badge
                          className={
                            company.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-extrabold text-[10.5px]"
                              : "bg-rose-50 text-rose-700 border-rose-300 font-extrabold text-[10.5px]"
                          }
                        >
                          {company.status || "ACTIVE"}
                        </Badge>
                      </td>

                      {/* Created Date */}
                      <td className="py-4 px-4 text-slate-500">
                        {company.createdAt
                          ? new Date(company.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </td>

                      {/* Actions Dropdown */}
                      <td className="py-4 px-5 text-right">
                        <button
                          type="button"
                          disabled={actionLoadingId === company.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (activeMenu?.id === company.id) {
                              setActiveMenu(null);
                              return;
                            }
                            const rect = e.currentTarget.getBoundingClientRect();
                            const spaceBelow = window.innerHeight - rect.bottom;
                            const menuHeight = 175;
                            const openUpwards = spaceBelow < menuHeight && rect.top > menuHeight;

                            setActiveMenu({
                              id: company.id,
                              company,
                              top: openUpwards ? rect.top - menuHeight - 4 : rect.bottom + 4,
                              right: Math.max(12, window.innerWidth - rect.right),
                            });
                          }}
                          className="actions-menu-trigger inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer focus-visible:outline-none"
                          aria-label="Tenant actions"
                        >
                          {actionLoadingId === company.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                          ) : (
                            <MoreVertical className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 text-center space-y-3">
              <Building2 className="h-10 w-10 mx-auto text-slate-300" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">No organizations found</p>
                <p className="text-xs text-slate-500">
                  {search ? `No results matching "${search}"` : "Get started by onboarding your first organization."}
                </p>
              </div>
              <Button
                onClick={() => setIsRegisterModalOpen(true)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl mt-2 cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-1" /> Register Organization
              </Button>
            </div>
          )}

          {/* Table Footer / Counter */}
          <div className="py-3 px-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <strong>{filteredCompanies.length}</strong> of <strong>{companies.length}</strong> total organizations
            </span>
          </div>
        </div>

        {/* ── 3. Register New Company Modal ── */}
        <Dialog open={isRegisterModalOpen} onOpenChange={setIsRegisterModalOpen}>
          <DialogContent className="w-[94vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-4 sm:p-8 font-sans border border-slate-200/90 shadow-2xl">
            <DialogHeader className="space-y-3 pb-2 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                      Onboard New Client Organization
                    </DialogTitle>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Provision enterprise tenant workspace & dispatch automated setup credentials.
                    </p>
                  </div>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleRegisterCompany} className="space-y-5 pt-2">
              {/* 2-Column Responsive Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {/* Organization Name */}
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                    Organization Name <span className="text-rose-500 font-black">*</span>
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                      value={companyForm.name}
                      onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                      placeholder="e.g. Facebook Company or Acme Corp"
                      required
                      className="pl-10 h-11 rounded-xl text-xs sm:text-sm font-medium border-slate-200 focus-visible:ring-2 focus-visible:ring-blue-600 shadow-2xs"
                    />
                  </div>
                </div>

                {/* Domain Type Selection */}
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                    Domain Hosting Mode <span className="text-rose-500 font-black">*</span>
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCompanyForm({ ...companyForm, domainMode: "SUBDOMAIN" })}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        companyForm.domainMode === "SUBDOMAIN"
                          ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900">HireQuest Subdomain</span>
                        <Badge variant="outline" className="text-[10px] font-bold border-blue-300 text-blue-700 bg-blue-50">
                          Included
                        </Badge>
                      </div>
                      <p className="text-[11.5px] text-slate-500">
                        Hosted on HireQuest infrastructure (e.g. <span className="font-mono text-blue-600 font-semibold">{slugPreview}.hirequest.com</span>)
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCompanyForm({ ...companyForm, domainMode: "CUSTOM_DOMAIN" })}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        companyForm.domainMode === "CUSTOM_DOMAIN"
                          ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/20"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900">Custom Domain</span>
                        <Badge variant="outline" className="text-[10px] font-bold border-indigo-300 text-indigo-700 bg-indigo-50">
                          White-Label
                        </Badge>
                      </div>
                      <p className="text-[11.5px] text-slate-500">
                        Company's own dedicated FQDN (e.g. <span className="font-mono text-indigo-600 font-semibold">facebookcompany.com</span>)
                      </p>
                    </button>
                  </div>
                </div>

                {/* Subdomain Mode Details */}
                {companyForm.domainMode === "SUBDOMAIN" ? (
                  <div className="sm:col-span-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Subdomain Access URLs</span>
                      <span className="text-[11px] font-mono text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        Slug: {slugPreview}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Local Development</span>
                        <span className="font-mono text-slate-800 font-semibold break-all">
                          http://{slugPreview}.localhost:3000
                        </span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Production</span>
                        <span className="font-mono text-slate-800 font-semibold break-all">
                          https://{slugPreview}.hirequest.com
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Custom Domain Mode Details */
                  <div className="sm:col-span-2 space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                        Enterprise Custom Domain <span className="text-rose-500 font-black">*</span>
                      </Label>
                      <div className="relative">
                        <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        <Input
                          value={companyForm.customDomain}
                          onChange={(e) => setCompanyForm({ ...companyForm, customDomain: e.target.value })}
                          placeholder="e.g. facebookcompany.com or careers.acme.com"
                          required
                          className="pl-10 h-11 rounded-xl text-xs sm:text-sm font-medium border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-600 shadow-2xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-950">White-Label Routing Preview</span>
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] font-bold">
                          Pending DNS Verification
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-white p-2.5 rounded-lg border border-indigo-100">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Local Dev Simulation (Active)</span>
                          <span className="font-mono text-indigo-700 font-semibold break-all">
                            http://{customDomainPrefix}.localhost:3000
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-indigo-100">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Production Target</span>
                          <span className="font-mono text-slate-800 font-semibold break-all">
                            https://{customDomainClean || "yourcompany.com"}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        ⚡ In local development, custom domain simulation operates immediately on <span className="font-mono font-medium">{customDomainPrefix}.localhost:3000</span> without DNS configuration.
                      </p>
                    </div>
                  </div>
                )}

                {/* Owner Work Email */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                    Owner Work Email Address <span className="text-rose-500 font-black">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                      type="email"
                      value={companyForm.ownerEmail}
                      onChange={(e) => setCompanyForm({ ...companyForm, ownerEmail: e.target.value })}
                      placeholder="owner@company.com"
                      required
                      className="pl-10 h-11 rounded-xl text-xs sm:text-sm font-medium border-slate-200 focus-visible:ring-2 focus-visible:ring-blue-600 shadow-2xs"
                    />
                  </div>
                </div>

                {/* Owner Name */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Owner Full Name <span className="text-slate-400 font-normal lowercase text-[11px]">(optional)</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                      value={companyForm.ownerName}
                      onChange={(e) => setCompanyForm({ ...companyForm, ownerName: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="pl-10 h-11 rounded-xl text-xs sm:text-sm font-medium border-slate-200 focus-visible:ring-2 focus-visible:ring-blue-600 shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Informative Callout Banner */}
              <div className="rounded-2xl bg-blue-50/70 border border-blue-100 p-3.5 flex items-start gap-3 text-xs text-blue-900">
                <div className="h-6 w-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Mail className="h-3.5 w-3.5" />
                </div>
                <div className="space-y-0.5">
                  <p className="font-bold text-blue-950">Automated Setup Link Delivery</p>
                  <p className="text-[11.5px] text-blue-800/90 leading-relaxed">
                    A secure onboarding activation invitation will be immediately emailed to the owner with a direct token link to configure their workspace password.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="h-11 px-5 text-xs sm:text-sm font-semibold rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !companyForm.name.trim() || !companyForm.ownerEmail.trim()}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm h-11 px-6 rounded-xl shadow-md shadow-blue-500/20 cursor-pointer gap-2 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Provisioning Workspace...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Create & Dispatch Activation</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        {/* ── 4. Floating Portal Actions Dropdown Menu (Guaranteed Zero Table Clipping) ── */}
        {activeMenu && typeof document !== "undefined" && createPortal(
          <div
            style={{
              position: "fixed",
              top: `${activeMenu.top}px`,
              right: `${activeMenu.right}px`,
            }}
            className="actions-menu-portal w-52 rounded-xl bg-white border border-slate-200 shadow-2xl shadow-slate-900/15 p-1.5 z-[99999] animate-in fade-in zoom-in-95 duration-100 font-sans text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Tenant Actions
            </p>

            <button
              type="button"
              onClick={() => {
                const targetId = activeMenu.id;
                setActiveMenu(null);
                router.push(`/admin/companies/${targetId}`);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer text-left"
            >
              <Eye className="h-4 w-4 text-slate-400" />
              <span>View Details</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const targetComp = activeMenu.company;
                setActiveMenu(null);
                handleResendActivation(targetComp);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer text-left"
            >
              <Send className="h-4 w-4 text-blue-600" />
              <span>Resend Activation Link</span>
            </button>

            <div className="my-1 border-t border-slate-100" />

            <button
              type="button"
              onClick={() => {
                const targetComp = activeMenu.company;
                setActiveMenu(null);
                handleToggleStatus(targetComp);
              }}
              className={`w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-left ${
                activeMenu.company.status === "ACTIVE"
                  ? "text-rose-600 hover:bg-rose-50"
                  : "text-emerald-600 hover:bg-emerald-50"
              }`}
            >
              {activeMenu.company.status === "ACTIVE" ? (
                <>
                  <Ban className="h-4 w-4 text-rose-500" />
                  <span>Suspend Tenant</span>
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4 text-emerald-500" />
                  <span>Activate Tenant</span>
                </>
              )}
            </button>
          </div>,
          document.body
        )}
      </main>
    </>
  );
}

export default function AdminCompaniesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-7 w-7 text-blue-600 animate-spin" />
          <p className="text-xs text-slate-500">Loading directory...</p>
        </div>
      }
    >
      <AdminCompaniesContent />
    </Suspense>
  );
}
