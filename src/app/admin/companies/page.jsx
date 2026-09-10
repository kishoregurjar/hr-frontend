"use client";

import { useState, useEffect, Suspense } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function AdminCompaniesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoOpenNewModal = searchParams.get("new") === "true";

  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Register New Company Modal State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(autoOpenNewModal);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [companyForm, setCompanyForm] = useState({
    name: "",
    domain: "",
    ownerName: "",
    ownerEmail: "",
    plan: "Enterprise",
  });

  const fetchCompanies = async () => {
    try {
      const data = await getAdminCompanies();
      setCompanies(Array.isArray(data) ? data : []);
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

    setIsSubmitting(true);
    try {
      await createAdminCompany({
        companyName: companyForm.name.trim(),
        ownerName: companyForm.ownerName.trim() || undefined,
        ownerEmail: companyForm.ownerEmail.trim(),
        domain: companyForm.domain.trim() || undefined,
        plan: companyForm.plan || "Enterprise",
      });

      toast.success("Organization created successfully! Welcome & activation email dispatched.");
      setIsRegisterModalOpen(false);
      setCompanyForm({
        name: "",
        domain: "",
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

                      {/* Domain / Website */}
                      <td className="py-4 px-4">
                        <span className="text-slate-600 font-medium">
                          {company.domain || company.website || company.slug || "—"}
                        </span>
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={actionLoadingId === company.id}
                              className="h-8 w-8 text-slate-400 hover:text-slate-700 cursor-pointer"
                            >
                              {actionLoadingId === company.id ? (
                                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                              ) : (
                                <MoreVertical className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl font-sans">
                            <DropdownMenuLabel className="text-[11px] text-slate-400 font-semibold uppercase">
                              Tenant Actions
                            </DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/admin/companies/${company.id}`}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <Eye className="h-4 w-4 text-slate-500" />
                                <span>View Details</span>
                              </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleResendActivation(company)}
                              className="flex items-center gap-2 cursor-pointer text-blue-600 font-medium"
                            >
                              <Send className="h-4 w-4 text-blue-600" />
                              <span>Resend Activation Link</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(company)}
                              className={`flex items-center gap-2 cursor-pointer font-medium ${
                                company.status === "ACTIVE"
                                  ? "text-rose-600 hover:text-rose-700"
                                  : "text-emerald-600 hover:text-emerald-700"
                              }`}
                            >
                              {company.status === "ACTIVE" ? (
                                <>
                                  <Ban className="h-4 w-4" />
                                  <span>Suspend Tenant</span>
                                </>
                              ) : (
                                <>
                                  <PlayCircle className="h-4 w-4" />
                                  <span>Activate Tenant</span>
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
          <DialogContent className="sm:max-w-lg rounded-3xl p-6 sm:p-8 font-sans">
            <DialogHeader className="space-y-2">
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <Building2 className="h-5 w-5" />
              </div>
              <DialogTitle className="text-xl font-black text-slate-900">
                Onboard New Client Organization
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Create a tenant account and dispatch an automated owner onboarding activation email.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleRegisterCompany} className="space-y-4 pt-2">
              {/* Company Name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Organization Name <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                    placeholder="Enter company workspace name"
                    required
                    className="pl-10 h-10 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Owner Work Email */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Owner Work Email Address <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    value={companyForm.ownerEmail}
                    onChange={(e) => setCompanyForm({ ...companyForm, ownerEmail: e.target.value })}
                    placeholder="owner@company.com"
                    required
                    className="pl-10 h-10 rounded-xl text-xs"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  The initial workspace invitation & activation link will be sent to this email.
                </p>
              </div>

              {/* Owner Name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Owner Full Name (Optional)
                </Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    value={companyForm.ownerName}
                    onChange={(e) => setCompanyForm({ ...companyForm, ownerName: e.target.value })}
                    placeholder="Enter owner full name"
                    className="pl-10 h-10 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Domain / Website */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Company Domain / Website (Optional)
                </Label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    value={companyForm.domain}
                    onChange={(e) => setCompanyForm({ ...companyForm, domain: e.target.value })}
                    placeholder="company.com"
                    className="pl-10 h-10 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="h-10 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !companyForm.name.trim() || !companyForm.ownerEmail.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-md cursor-pointer gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Creating Tenant...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Create & Send Activation</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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
