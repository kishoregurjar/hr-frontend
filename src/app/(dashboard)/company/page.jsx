"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  Users,
  Mail,
  Shield,
  Upload,
  UserPlus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Globe,
  Phone,
  MapPin,
  Clock,
  Crown,
  UserCheck,
  ChevronRight,
  Loader2,
  XCircle,
  RefreshCw,
  ShieldAlert,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  getCompanyProfile,
  updateCompanyProfile,
  uploadCompanyLogo,
  getCompanyMembers,
  updateMemberRole,
  removeMember,
  transferOwnership,
  sendMemberInvitation,
  getCompanyInvitations,
  revokeInvitation,
} from "@/lib/api/company";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/context";

export default function CompanySettingsPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState(initialTab); // 'profile' | 'members' | 'invitations'
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const defaultCompanyName =
    (typeof window !== "undefined" ? localStorage.getItem("companyName") : null) ||
    user?.companyName ||
    user?.company?.name ||
    user?.company ||
    "";
  const defaultCompanyLogo =
    (typeof window !== "undefined" ? localStorage.getItem("companyLogo") : null) ||
    user?.companyLogo ||
    "";

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["profile", "members", "invitations"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Profile Form State
  const [company, setCompany] = useState({
    name: defaultCompanyName,
    logoUrl: defaultCompanyLogo,
  });
  const [formData, setFormData] = useState({
    name: defaultCompanyName,
    website: "",
    industry: "Technology",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    description: "",
  });

  // Members & Invites State
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [invitationStatusFilter, setInvitationStatusFilter] = useState("PENDING"); // 'PENDING' | 'ACCEPTED' | 'ALL'
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingInvites, setLoadingInvites] = useState(false);

  // Invite Modal / Form
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("RECRUITER");
  const [sendingInvite, setSendingInvite] = useState(false);

  // Transfer Ownership Dialog
  const [transferTargetMember, setTransferTargetMember] = useState(null);
  const [transferring, setTransferring] = useState(false);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      const data = await getCompanyProfile();
      if (data && (data.id || data.name || data.companyName)) {
        const compName = data.name || data.companyName || defaultCompanyName;
        const compLogo = data.logoUrl || data.logo || defaultCompanyLogo;
        const compWebsite = data.website || data.websiteUrl || "";
        const compIndustry = data.industry || "Technology";
        const compEmail = data.email || data.officialEmail || "";
        const compPhone = data.phone || "";
        const compAddress = data.address || "";
        const compCity = data.city || "";
        const compCountry = data.country || "";
        const compDesc = data.description || data.about || "";

        setCompany({
          ...data,
          name: compName,
          logoUrl: compLogo,
        });

        setFormData({
          name: compName,
          website: compWebsite,
          websiteUrl: compWebsite,
          industry: compIndustry,
          email: compEmail,
          officialEmail: compEmail,
          phone: compPhone,
          address: compAddress,
          city: compCity,
          country: compCountry,
          description: compDesc,
          about: compDesc,
        });

        if (compLogo && typeof window !== "undefined") {
          localStorage.setItem("companyLogo", compLogo);
        }
        if (compName && typeof window !== "undefined") {
          localStorage.setItem("companyName", compName);
        }
      } else {
        setCompany(null);
      }
    } catch {
      const fallbackName =
        (typeof window !== "undefined" ? localStorage.getItem("companyName") : null) || "";
      if (fallbackName) {
        setCompany({
          name: fallbackName,
          logoUrl: typeof window !== "undefined" ? localStorage.getItem("companyLogo") || "" : "",
        });
        setFormData((prev) => ({ ...prev, name: fallbackName }));
      } else {
        setCompany(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      setLoadingMembers(true);
      const res = await getCompanyMembers({ page: 1, limit: 50 });
      const list = Array.isArray(res)
        ? res
        : res?.data?.data?.members ||
          res?.data?.members ||
          res?.members ||
          (Array.isArray(res?.data) ? res?.data : []);
      setMembers(list || []);
    } catch {
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  const fetchInvites = async (status = invitationStatusFilter) => {
    try {
      setLoadingInvites(true);
      const params = { page: 1, limit: 50 };
      if (status && status !== "ALL") {
        params.status = status;
      }
      const res = await getCompanyInvitations(params);
      const list = Array.isArray(res)
        ? res
        : res?.data?.data?.invitations ||
          res?.data?.invitations ||
          res?.invitations ||
          (Array.isArray(res?.data) ? res?.data : []);
      setInvitations(list || []);
    } catch {
      setInvitations([]);
    } finally {
      setLoadingInvites(false);
    }
  };

  const handleFilterChange = (status) => {
    setInvitationStatusFilter(status);
    fetchInvites(status);
  };

  useEffect(() => {
    fetchCompanyData();
    fetchMembers();
    fetchInvites(invitationStatusFilter);
  }, []);

  useEffect(() => {
    if (activeTab === "members") fetchMembers();
    if (activeTab === "invitations") fetchInvites(invitationStatusFilter);
  }, [activeTab]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const payload = {
        name: formData.name,
        website: formData.website || formData.websiteUrl || "",
        websiteUrl: formData.website || formData.websiteUrl || "",
        industry: formData.industry || "Technology",
        email: formData.email || formData.officialEmail || "",
        officialEmail: formData.email || formData.officialEmail || "",
        phone: formData.phone || "",
        address: formData.address || "",
        city: formData.city || "",
        country: formData.country || "",
        description: formData.description || formData.about || "",
        about: formData.description || formData.about || "",
      };
      const res = await updateCompanyProfile(payload);
      toast.success("Company profile updated successfully!");
      if (res?.name && typeof window !== "undefined") {
        localStorage.setItem("companyName", res.name);
      }
      fetchCompanyData();
    } catch (err) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Logo file size must be less than 5MB.");
      return;
    }

    setUploadingLogo(true);
    try {
      const res = await uploadCompanyLogo(file);
      const logoUrl =
        res?.data?.logoUrl ||
        res?.logoUrl ||
        res?.company?.logoUrl ||
        res?.data?.company?.logoUrl ||
        res?.url;
      if (logoUrl) {
        setCompany((prev) => ({ ...prev, logoUrl }));
        if (typeof window !== "undefined") {
          localStorage.setItem("companyLogo", logoUrl);
        }
      }
      toast.success("Company logo uploaded successfully!");
      await fetchCompanyData();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Failed to upload logo.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) {
      toast.error("Please enter recruiter's email address.");
      return;
    }
    setSendingInvite(true);
    try {
      await sendMemberInvitation({ email: inviteEmail, role: inviteRole });
      toast.success(`Invitation sent to ${inviteEmail} (${inviteRole})`);
      setInviteEmail("");
      fetchInvites();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to send invitation.";
      toast.error(msg);
      fetchInvites();
    } finally {
      setSendingInvite(false);
    }
  };

  const handleRevokeInvite = async (invitationId) => {
    try {
      await revokeInvitation(invitationId);
      toast.success("Invitation revoked successfully.");
      setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
    } catch (err) {
      toast.error(err.message || "Failed to revoke invitation.");
    }
  };

  const handleUpdateRole = async (memberId, newRole) => {
    try {
      await updateMemberRole(memberId, newRole);
      toast.success(`Role updated to ${newRole}`);
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      );
    } catch (err) {
      toast.error(err.message || "Failed to update member role.");
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm("Are you sure you want to remove this member from your company?")) return;
    try {
      await removeMember(memberId);
      toast.success("Member removed from company.");
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (err) {
      toast.error(err.message || "Failed to remove member.");
    }
  };

  const handleTransferOwnership = async () => {
    if (!transferTargetMember) return;
    setTransferring(true);
    try {
      await transferOwnership(transferTargetMember.id);
      toast.success(`Ownership transferred successfully to ${transferTargetMember.user?.email || "member"}`);
      setTransferTargetMember(null);
      fetchMembers();
    } catch (err) {
      toast.error(err.message || "Failed to transfer ownership.");
    } finally {
      setTransferring(false);
    }
  };

  const activeCompanyRole =
    user?.activeCompany?.role ||
    user?.companies?.[0]?.role ||
    user?.companyRole ||
    (user?.isOwner ? "OWNER" : "") ||
    user?.role ||
    "";

  const isOwnerOrAdmin = Boolean(
    user?.isOwner ||
    user?.isAdmin ||
    String(activeCompanyRole).toUpperCase() === "OWNER" ||
    String(activeCompanyRole).toUpperCase() === "ADMIN" ||
    String(activeCompanyRole).toUpperCase() === "COMPANY_OWNER" ||
    String(activeCompanyRole).toUpperCase() === "COMPANY_ADMIN" ||
    user?.companyRole === "OWNER" ||
    user?.companyRole === "ADMIN" ||
    user?.role === "Company Owner" ||
    user?.role === "HR Admin"
  );

  // Access Guard: If logged in as Recruiter / Team Member, restrict settings access
  if (user && !isOwnerOrAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center space-y-5 max-w-md mx-auto my-12 bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/60 font-sans">
        <div className="h-16 w-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shadow-xs">
          <ShieldAlert className="h-8 w-8 text-amber-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-900">Owner Access Required</h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
            Company Profile, Team Members, and Recruiter Invitations are managed exclusively by the Workspace Owner and Administrators.
          </p>
        </div>
        <div className="w-full pt-2">
          <Link href="/dashboard" className="block w-full">
            <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 cursor-pointer">
              Return to Screening Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      {/* ── Navigation Tabs ── */}
      <div className="flex items-center gap-2 border-b">
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "profile"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 className="h-4 w-4" />
          Company Profile & Logo
        </button>

        <button
          onClick={() => setActiveTab("members")}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "members"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-4 w-4" />
          Team Members ({members.length})
        </button>

        <button
          onClick={() => setActiveTab("invitations")}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "invitations"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Mail className="h-4 w-4" />
          Recruiter Invitations ({invitations.length})
        </button>
      </div>

      {/* ── TAB 1: Company Profile & Logo ── */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Logo & Branding Card */}
          <div className="lg:col-span-1 rounded-2xl border bg-card p-6 shadow-sm space-y-5 h-fit">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              Company Logo
            </h3>
                <p className="text-xs text-muted-foreground">
                  This logo will appear on candidate assessment tests, email invites, and scorecards.
                </p>

                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl bg-slate-50/60 space-y-3 text-center">
                  {company?.logoUrl ? (
                    <img
                      src={company.logoUrl}
                      alt={company?.name || "Company"}
                      className="h-24 w-24 object-contain rounded-xl border bg-white shadow-sm"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-3xl shadow-inner">
                      {company?.name ? company.name[0]?.toUpperCase() : "C"}
                    </div>
                  )}

                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                      className="hidden"
                    />
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-800 shadow-sm transition-all">
                      {uploadingLogo ? (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      ) : (
                        <Upload className="h-4 w-4 text-blue-600" />
                      )}
                      {uploadingLogo ? "Uploading..." : "Upload New Logo"}
                    </div>
                  </label>
                  <p className="text-[10px] text-muted-foreground">JPG, PNG, WEBP (Max 5MB)</p>
                </div>

                <div className="space-y-2 border-t pt-4 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Company Slug:</span>
                    <span className="font-mono font-bold text-slate-700">{company?.slug || "n/a"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Company ID:</span>
                    <span className="font-mono text-[10px] text-slate-500 truncate max-w-[140px]">
                      {company?.id || "n/a"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Profile Form */}
              <div className="lg:col-span-2 rounded-2xl border bg-card p-6 shadow-sm space-y-6">
                <h3 className="font-bold text-base text-slate-900">Company Information</h3>

                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Company Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                        placeholder="e.g. Acme Corporation"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Website URL</label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                        placeholder="https://company.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Industry</label>
                      <input
                        type="text"
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                        placeholder="e.g. Technology / SaaS"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Official Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                        placeholder="hr@company.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Phone</label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                        placeholder="+1 555-0199"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                        placeholder="e.g. San Francisco"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Country</label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                        placeholder="e.g. USA"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Office Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                      placeholder="123 Innovation Drive, Suite 400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">About Company</label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-3 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-blue-600 outline-none resize-none"
                      placeholder="Brief description of your company..."
                    />
                  </div>

                  <div className="flex justify-end pt-3">
                    <Button
                      type="submit"
                      disabled={savingProfile}
                      className="bg-blue-600 hover:bg-blue-700 font-bold px-6 shadow-md"
                    >
                      {savingProfile ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Profile Changes"
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ── TAB 2: Team Members ── */}
          {activeTab === "members" && (
            <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b">
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Company Team Members
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Team members can review candidate assessments and coordinate recruitment pipelines.
                  </p>
                </div>
                <Button
                  onClick={() => setActiveTab("invitations")}
                  className="bg-blue-600 hover:bg-blue-700 font-bold text-xs"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite New Member
                </Button>
              </div>

              {loadingMembers ? (
                <div className="py-12 text-center text-muted-foreground animate-pulse text-sm">
                  Loading team members...
                </div>
              ) : members.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b bg-slate-50/70 text-slate-600 text-xs font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">Member</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Joined Date</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {members.map((member) => {
                        const isOwner = member.role === "OWNER";
                        const isAdmin = member.role === "ADMIN";

                        return (
                          <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                                  {member.user?.name ? member.user.name[0] : "U"}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900">
                                    {member.user?.name || member.name || "Team Member"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {member.user?.email || member.email || "No email available"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              {isOwner ? (
                                <Badge className="bg-amber-100 text-amber-800 border-amber-200 font-bold gap-1">
                                  <Crown className="h-3 w-3 text-amber-600" />
                                  OWNER
                                </Badge>
                              ) : isAdmin ? (
                                <Badge className="bg-purple-100 text-purple-800 border-purple-200 font-bold gap-1">
                                  <Shield className="h-3 w-3 text-purple-600" />
                                  ADMIN
                                </Badge>
                              ) : (
                                <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-bold gap-1">
                                  <UserCheck className="h-3 w-3 text-blue-600" />
                                  RECRUITER
                                </Badge>
                              )}
                            </td>
                            <td className="py-4 px-4 text-xs text-muted-foreground">
                              {member.createdAt
                                ? new Date(member.createdAt).toLocaleDateString()
                                : "—"}
                            </td>
                            <td className="py-4 px-4 text-right">
                              {!isOwner ? (
                                <div className="flex items-center justify-end gap-2">
                                  <select
                                    value={member.role}
                                    onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                                    className="h-8 px-2 rounded-lg border text-xs bg-background font-medium outline-none"
                                  >
                                    <option value="RECRUITER">RECRUITER</option>
                                    <option value="ADMIN">ADMIN</option>
                                  </select>

                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleRemoveMember(member.id)}
                                    className="text-red-600 hover:bg-red-50 h-8 px-2"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground font-medium">
                                  Primary Owner
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  No additional team members found. Invite recruiters above!
                </div>
              )}
            </div>
          )}

          {/* ── TAB 3: Team Invitations ── */}
          {activeTab === "invitations" && (
            <div className="space-y-6">
              {/* Send Invitation Form */}
              <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-blue-600" />
                  Invite Colleague / Recruiter
                </h3>
                <p className="text-xs text-muted-foreground">
                  Send an email invitation link to join your company assessment workspace.
                </p>

                <form
                  onSubmit={handleSendInvite}
                  className="flex flex-col sm:flex-row items-end gap-3 max-w-2xl"
                >
                  <div className="flex-1 space-y-1.5 w-full">
                    <label className="text-xs font-bold text-slate-700">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                      placeholder="recruiter@company.com"
                    />
                  </div>

                  <div className="w-full sm:w-44 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Role</label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-blue-600 outline-none font-semibold"
                    >
                      <option value="RECRUITER">RECRUITER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>

                  <Button
                    type="submit"
                    disabled={sendingInvite}
                    className="w-full sm:w-auto h-10 bg-blue-600 hover:bg-blue-700 font-bold px-6 shadow-md"
                  >
                    {sendingInvite ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Invite"}
                  </Button>
                </form>
              </div>

              {/* Recruiter Invitations Table with Status Filter */}
              <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                      Recruiter Invitations ({invitations.length})
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Track and manage recruiter invitations across your company workspace.
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => handleFilterChange("PENDING")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        invitationStatusFilter === "PENDING"
                          ? "bg-white text-blue-600 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFilterChange("ACCEPTED")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        invitationStatusFilter === "ACCEPTED"
                          ? "bg-white text-blue-600 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Accepted
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFilterChange("ALL")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        invitationStatusFilter === "ALL"
                          ? "bg-white text-blue-600 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      All
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => fetchInvites(invitationStatusFilter)}
                      className="h-7 px-2 text-slate-500 hover:text-slate-900 ml-1"
                      title="Refresh invitations list"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {loadingInvites ? (
                  <div className="py-8 text-center text-muted-foreground animate-pulse text-sm">
                    Loading {invitationStatusFilter.toLowerCase()} invitations...
                  </div>
                ) : invitations.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b bg-slate-50/70 text-slate-600 text-xs font-bold uppercase tracking-wider">
                          <th className="py-3 px-4">Invited Email</th>
                          <th className="py-3 px-4">Role</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Date Sent</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {invitations.map((inv) => {
                          const statusUpper = String(inv.status || "PENDING").toUpperCase();
                          const isPending = statusUpper === "PENDING";
                          const isAccepted = statusUpper === "ACCEPTED";
                          const isExpired = statusUpper === "EXPIRED";
                          const isRevoked = statusUpper === "REVOKED";

                          return (
                            <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3.5 px-4 font-bold text-slate-900">{inv.email}</td>
                              <td className="py-3.5 px-4">
                                <Badge variant="outline" className="font-bold text-xs">
                                  {inv.role}
                                </Badge>
                              </td>
                              <td className="py-3.5 px-4">
                                {isAccepted ? (
                                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs font-semibold gap-1">
                                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                    ACCEPTED
                                  </Badge>
                                ) : isExpired ? (
                                  <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-xs font-semibold">
                                    EXPIRED
                                  </Badge>
                                ) : isRevoked ? (
                                  <Badge className="bg-rose-100 text-rose-700 border-rose-200 text-xs font-semibold">
                                    REVOKED
                                  </Badge>
                                ) : (
                                  <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs font-semibold gap-1">
                                    <Clock className="h-3 w-3 text-amber-600" />
                                    PENDING
                                  </Badge>
                                )}
                              </td>
                              <td className="py-3.5 px-4 text-xs text-muted-foreground">
                                {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : "—"}
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                {isPending ? (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleRevokeInvite(inv.id)}
                                    className="text-red-600 hover:bg-red-50 text-xs font-bold h-8 px-2.5"
                                  >
                                    Revoke
                                  </Button>
                                ) : isAccepted ? (
                                  <span className="text-xs text-emerald-700 font-bold inline-flex items-center gap-1">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Joined
                                  </span>
                                ) : (
                                  <span className="text-xs text-muted-foreground font-medium">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground text-sm">
                    No {invitationStatusFilter === "ALL" ? "" : invitationStatusFilter.toLowerCase()} invitations found.
                  </div>
                )}
              </div>
            </div>
          )}
    </div>
  );
}
