"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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
  ShieldCheck,
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
  deactivateMember,
  reactivateMember,
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
  const router = useRouter();

  // Scroll & Parallax Refs
  const scrollContainerRef = useRef(null);
  const farBgRef = useRef(null);
  const midHeroRef = useRef(null);

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
    "Facebook Company";
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
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("companyLogoUpdated"));
          window.dispatchEvent(new Event("companyUpdated"));
        }
      } else {
        setCompany(null);
      }
    } catch {
      const fallbackName =
        (typeof window !== "undefined" ? localStorage.getItem("companyName") : null) || defaultCompanyName;
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
    if (initialTab === "members") fetchMembers();
    if (initialTab === "invitations") fetchInvites(invitationStatusFilter);
  }, []);

  useEffect(() => {
    if (activeTab === "members" && members.length === 0) fetchMembers();
    if (activeTab === "invitations" && invitations.length === 0) fetchInvites(invitationStatusFilter);
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
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("companyLogoUpdated"));
        window.dispatchEvent(new Event("companyUpdated"));
      }
      await fetchCompanyData();
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
          window.dispatchEvent(new Event("companyLogoUpdated"));
          window.dispatchEvent(new Event("companyUpdated"));
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

  const handleDeactivateMember = async (memberId) => {
    if (!confirm("Deactivate this account?\nThis user will no longer be able to log in until the account is reactivated.")) return;
    try {
      await deactivateMember(memberId);
      toast.success("Member deactivated.");
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, user: { ...m.user, status: "DEACTIVATED" } } : m))
      );
    } catch (err) {
      toast.error(err.message || "Failed to deactivate member.");
    }
  };

  const handleReactivateMember = async (memberId) => {
    if (!confirm("Reactivate this account?\nThis user will be able to log in again.")) return;
    try {
      await reactivateMember(memberId);
      toast.success("Member reactivated.");
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, user: { ...m.user, status: "ACTIVE" } } : m))
      );
    } catch (err) {
      toast.error(err.message || "Failed to reactivate member.");
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
    "Owner";

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

  // ── Parallax Scroll Handler ──
  const handleScroll = () => {
    const scrollY = scrollContainerRef.current?.scrollTop || 0;

    // 1. Far background: decorative rings & ambient orbs inside hero banner (0.58x counter-lag)
    if (farBgRef.current) {
      const orbTranslate = scrollY * 0.58;
      const orbRotate = scrollY * 0.05;
      const orbScale = 1 + scrollY * 0.0003;
      farBgRef.current.style.transform = `translate3d(0, ${orbTranslate}px, 0) scale(${orbScale}) rotate(${orbRotate}deg)`;
    }

    // 2. Midground Hero Content: Title, subtitle, badge (0.42x counter-lag)
    if (midHeroRef.current) {
      const heroProgress = Math.min(scrollY / 450, 1);
      const heroTranslate = scrollY * 0.42;
      const heroOpacity = Math.max(1 - heroProgress * 0.75, 0.2);
      const heroScale = 1 - heroProgress * 0.06;
      midHeroRef.current.style.transform = `translate3d(0, ${heroTranslate}px, 0) scale(${heroScale})`;
      midHeroRef.current.style.opacity = heroOpacity;
    }
  };

  const pendingInvitesCount = useMemo(() => {
    return (invitations || []).filter(
      (inv) => String(inv.status || "PENDING").toUpperCase() === "PENDING"
    ).length;
  }, [invitations]);

  // Access Guard: If logged in as Recruiter / Team Member, restrict settings access
  if (user && !isOwnerOrAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center space-y-5 max-w-md mx-auto my-12 bg-white rounded-3xl border border-white/90 shadow-[0_12px_30px_rgba(79,70,229,0.08),0_2px_8px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/5 font-sans">
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
            <Button className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/20 cursor-pointer">
              Return to Screening Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      title: "Team Members",
      value: members.length,
      description: "Active recruiters & team",
      icon: Users,
      iconBg: "bg-indigo-500/10",
      iconColor: "text-indigo-600",
    },
    {
      title: "Pending Invitations",
      value: pendingInvitesCount,
      description: "Awaiting member sign-up",
      icon: Mail,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600",
    },
    {
      title: "Workspace Role",
      value: String(activeCompanyRole).replace(/_/g, " ").toUpperCase() || "OWNER",
      description: "Your permission tier",
      icon: Crown,
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-600",
    },
    {
      title: "Organization Status",
      value: "Verified",
      description: "Active recruitment workspace",
      icon: ShieldCheck,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
    },
  ];

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="-m-4 md:-m-6 h-[calc(100dvh-64px)] max-h-[calc(100dvh-64px)] overflow-y-auto overflow-x-hidden relative bg-[#f8fafc] no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden font-sans"
    >
      {/* ── Layer 1 & 2: 3D Parallax Hero Header ── */}
      <div className="relative bg-gradient-to-r from-[#4E35E8] via-[#6D38F0] to-[#CF2E9F] text-white pt-10 pb-36 md:pb-40 px-6 md:px-12 overflow-hidden shadow-lg select-none">
        {/* Far Background: Rotating Ambient Orbs & Concentric Rings */}
        <div
          ref={farBgRef}
          className="absolute inset-0 pointer-events-none will-change-transform"
          style={{ transform: "translate3d(0, 0, 0)" }}
        >
          <div className="absolute -top-28 -right-28 w-[450px] h-[450px] rounded-full bg-white/12 blur-3xl" />
          <div className="absolute -top-16 -right-16 w-[380px] h-[380px] rounded-full border border-white/20" />
          <div className="absolute top-10 right-16 w-[260px] h-[260px] rounded-full border border-white/15" />
          <div className="absolute top-28 right-36 w-[140px] h-[140px] rounded-full border border-white/10" />

          {/* Floating Subtle Shimmer Sparks */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-white/40 blur-[1px] animate-pulse" />
          <div className="absolute top-1/3 left-2/3 w-2.5 h-2.5 rounded-full bg-pink-200/50 blur-[1px] animate-pulse" />
        </div>

        {/* Midground: Hero Content (0.42x Parallax Speed) */}
        <div
          ref={midHeroRef}
          className="max-w-7xl mx-auto space-y-4 relative z-10 will-change-transform"
          style={{ transform: "translate3d(0, 0, 0)" }}
        >
          <div className="space-y-1">
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-white/75 drop-shadow-xs">
              {company?.name || defaultCompanyName}
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight drop-shadow-sm">
              Company & Team
            </h1>
            <p className="text-white/85 text-xs sm:text-sm font-medium leading-relaxed max-w-2xl">
              Manage organization workspace details, branding identity, recruiter team access, and member invitations
            </p>
          </div>

          {/* Workspace Status Banner */}
          <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-2.5 px-4 flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 text-white shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-xl bg-white/20 border border-white/30 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="text-xs min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-white shrink-0 text-xs">Workspace Settings:</span>
                  <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/40 text-[11px] py-0.5 px-2.5 flex items-center gap-1.5 font-semibold rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                    Organization Workspace Active
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  fetchCompanyData();
                  fetchMembers();
                  fetchInvites();
                }}
                className="text-xs h-8 px-3 gap-1.5 bg-white/15 hover:bg-white/25 text-white border border-white/30 font-semibold rounded-xl shadow-xs cursor-pointer transition-all"
                title="Refresh Workspace Data"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-white" : ""}`} />
                <span>Refresh Data</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Layer 3: Main Foreground Content (-mt-20 to overlap hero) ── */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 md:px-12 -mt-20 md:-mt-24 pb-16 space-y-6">
        {/* KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 font-sans">
          {kpiCards.map((card, i) => (
            <div
              key={i}
              className="group rounded-3xl border border-white/90 bg-white/95 backdrop-blur-md p-6 sm:p-7 shadow-[0_12px_30px_rgba(79,70,229,0.08),0_2px_8px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {card.title}
                </span>
                <div
                  className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 ${card.iconBg} ${card.iconColor}`}
                >
                  <card.icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight truncate">
                  {card.value}
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Navigation Tabs Capsule ── */}
        <div className="rounded-2xl border border-white/90 bg-white/95 backdrop-blur-md p-1.5 shadow-[0_12px_30px_rgba(79,70,229,0.08),0_2px_8px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/5 flex items-center gap-1.5 overflow-x-auto no-scrollbar [scrollbar-width:none]">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`py-2 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "profile"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
            }`}
          >
            <Building2 className="h-4 w-4" />
            Company Profile & Logo
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("members")}
            className={`py-2 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "members"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
            }`}
          >
            <Users className="h-4 w-4" />
            Team Members ({members.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("invitations")}
            className={`py-2 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "invitations"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
            }`}
          >
            <Mail className="h-4 w-4" />
            Recruiter Invitations ({invitations.length})
          </button>
        </div>

        {/* ── TAB 1: Company Profile & Logo ── */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
            {/* Left Column: Logo & Branding Card */}
            <div className="lg:col-span-1 rounded-3xl border border-white/90 bg-white/95 backdrop-blur-md p-6 sm:p-7 shadow-[0_12px_30px_rgba(79,70,229,0.08),0_2px_8px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/5 space-y-5 h-fit">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                Company Logo & Identity
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                This logo will appear across candidate screening tests, email notifications, invites, and scorecards.
              </p>

              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-indigo-200/80 rounded-2xl bg-indigo-50/30 space-y-3.5 text-center">
                {company?.logoUrl ? (
                  <img
                    src={company.logoUrl}
                    alt={company?.name || "Company"}
                    className="h-28 w-28 object-contain rounded-2xl border border-slate-200 bg-white shadow-xs p-1"
                  />
                ) : (
                  <div className="h-28 w-28 rounded-2xl bg-indigo-100/80 text-indigo-700 flex items-center justify-center font-black text-4xl shadow-inner border border-indigo-200">
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
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-800 shadow-2xs transition-all">
                    {uploadingLogo ? (
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                    ) : (
                      <Upload className="h-4 w-4 text-indigo-600" />
                    )}
                    {uploadingLogo ? "Uploading..." : "Upload New Logo"}
                  </div>
                </label>
                <p className="text-[10.5px] text-slate-500 font-medium">JPG, PNG, WEBP (Max 5MB)</p>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Company Slug:</span>
                  <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                    {company?.slug || "n/a"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Company ID:</span>
                  <span className="font-mono text-[11px] text-slate-600 truncate max-w-[140px] font-semibold">
                    {company?.id || "n/a"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Profile Form */}
            <div className="lg:col-span-2 rounded-3xl border border-white/90 bg-white/95 backdrop-blur-md p-6 sm:p-7 shadow-[0_12px_30px_rgba(79,70,229,0.08),0_2px_8px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/5 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-base text-slate-900">Organization Information</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Update primary contact, industry classification, and official recruitment profile details
                </p>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Company Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-2xs"
                      placeholder="e.g. Acme Corporation"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Website URL</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-2xs"
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
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-2xs"
                      placeholder="e.g. Technology / SaaS"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Official Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-2xs"
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
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-2xs"
                      placeholder="+1 555-0199"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-2xs"
                      placeholder="e.g. San Francisco"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Country</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-2xs"
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
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-2xs"
                    placeholder="Street address, Suite / Floor"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">About Company</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-2xs resize-none"
                    placeholder="Brief description of your company mission and workspace..."
                  />
                </div>

                <div className="flex justify-end pt-3">
                  <Button
                    type="submit"
                    disabled={savingProfile}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-10 px-6 rounded-xl shadow-xs cursor-pointer"
                  >
                    {savingProfile ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving Changes...
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
          <div className="rounded-3xl border border-white/90 bg-white/95 backdrop-blur-md p-6 sm:p-7 shadow-[0_12px_30px_rgba(79,70,229,0.08),0_2px_8px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/5 space-y-6 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  Organization Team Members ({members.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Team members can review candidate assessments and coordinate recruitment pipelines
                </p>
              </div>
              <Button
                onClick={() => setActiveTab("invitations")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-xs cursor-pointer"
              >
                <UserPlus className="h-4 w-4 mr-1.5" />
                Invite New Member
              </Button>
            </div>

            {loadingMembers ? (
              <div className="py-12 text-center text-slate-400 animate-pulse text-xs font-semibold">
                Loading organization members...
              </div>
            ) : members.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Member</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Joined Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {members.map((member) => {
                      const isOwner = member.role === "OWNER";
                      const isAdmin = member.role === "ADMIN";

                      return (
                        <tr key={member.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-xl bg-indigo-100/80 text-indigo-700 font-extrabold flex items-center justify-center text-xs border border-indigo-200/80 shadow-2xs">
                                {member.user?.name ? member.user.name[0]?.toUpperCase() : "U"}
                              </div>
                              <div>
                                <p className="font-extrabold text-slate-900 text-xs">
                                  {member.user?.name || member.name || "Team Member"}
                                </p>
                                <p className="text-[11px] text-slate-500 font-medium">
                                  {member.user?.email || member.email || "No email available"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            {isOwner ? (
                              <Badge className="bg-amber-100 text-amber-800 border-amber-200 font-bold gap-1 text-[10.5px]">
                                <Crown className="h-3 w-3 text-amber-600" />
                                OWNER
                              </Badge>
                            ) : isAdmin ? (
                              <Badge className="bg-purple-100 text-purple-800 border-purple-200 font-bold gap-1 text-[10.5px]">
                                <Shield className="h-3 w-3 text-purple-600" />
                                ADMIN
                              </Badge>
                            ) : (
                              <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 font-bold gap-1 text-[10.5px]">
                                <UserCheck className="h-3 w-3 text-indigo-600" />
                                RECRUITER
                              </Badge>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-xs font-bold">
                            {member.user?.status === "DEACTIVATED" ? (
                              <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 text-[10.5px] font-bold">
                                DEACTIVATED
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50 text-[10.5px] font-bold">
                                ACTIVE
                              </Badge>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-500 font-medium">
                            {member.createdAt
                              ? new Date(member.createdAt).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {!isOwner ? (
                              <div className="flex items-center justify-end gap-2">
                                <select
                                  value={member.role}
                                  onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                                  className="h-8 px-2.5 rounded-lg border border-slate-200 text-xs bg-slate-50/70 font-semibold outline-none cursor-pointer"
                                >
                                  <option value="RECRUITER">RECRUITER</option>
                                  <option value="ADMIN">ADMIN</option>
                                </select>

                                {member.user?.status === "DEACTIVATED" ? (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleReactivateMember(member.id)}
                                    className="text-emerald-600 hover:bg-emerald-50 h-8 px-2.5 font-bold text-xs cursor-pointer"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                    Reactivate
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeactivateMember(member.id)}
                                    className="text-amber-600 hover:bg-amber-50 h-8 px-2.5 font-bold text-xs cursor-pointer"
                                  >
                                    <AlertCircle className="h-3.5 w-3.5 mr-1" />
                                    Deactivate
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-500 font-bold">
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
              <div className="py-12 text-center text-slate-500 text-xs font-semibold">
                No additional team members found. Invite recruiters to join!
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: Team Invitations ── */}
        {activeTab === "invitations" && (
          <div className="space-y-6 font-sans">
            {/* Send Invitation Form */}
            <div className="rounded-3xl border border-white/90 bg-white/95 backdrop-blur-md p-6 sm:p-7 shadow-[0_12px_30px_rgba(79,70,229,0.08),0_2px_8px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/5 space-y-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-indigo-600" />
                  Invite Colleague / Recruiter
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Send an email invitation link to join your company assessment workspace
                </p>
              </div>

              <form
                onSubmit={handleSendInvite}
                className="flex flex-col sm:flex-row sm:items-end gap-3 max-w-2xl pt-2"
              >
                <div className="flex-1 space-y-1.5 w-full">
                  <label className="text-xs font-bold text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-2xs"
                    placeholder="recruiter@company.com"
                  />
                </div>

                <div className="w-full sm:w-44 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-2xs cursor-pointer"
                  >
                    <option value="RECRUITER">RECRUITER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  disabled={sendingInvite}
                  className="w-full sm:w-auto h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 rounded-xl shadow-xs cursor-pointer"
                >
                  {sendingInvite ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Invite"}
                </Button>
              </form>
            </div>

            {/* Recruiter Invitations Table with Status Filter */}
            <div className="rounded-3xl border border-white/90 bg-white/95 backdrop-blur-md p-6 sm:p-7 shadow-[0_12px_30px_rgba(79,70,229,0.08),0_2px_8px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-indigo-600" />
                    Sent Invitations ({invitations.length})
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Track and manage invitation status across your recruitment workspace
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => handleFilterChange("PENDING")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      invitationStatusFilter === "PENDING"
                        ? "bg-white text-indigo-600 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFilterChange("ACCEPTED")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      invitationStatusFilter === "ACCEPTED"
                        ? "bg-white text-indigo-600 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Accepted
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFilterChange("ALL")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      invitationStatusFilter === "ALL"
                        ? "bg-white text-indigo-600 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    All
                  </button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fetchInvites(invitationStatusFilter)}
                    className="h-7 px-2 text-slate-500 hover:text-slate-900 ml-1 cursor-pointer"
                    title="Refresh invitations list"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${loadingInvites ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </div>

              {loadingInvites ? (
                <div className="py-8 text-center text-slate-400 animate-pulse text-xs font-semibold">
                  Loading {invitationStatusFilter.toLowerCase()} invitations...
                </div>
              ) : invitations.length > 0 ? (
                <div className="overflow-x-auto rounded-2xl border border-slate-100">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4">Invited Email</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Date Sent</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {invitations.map((inv) => {
                        const statusUpper = String(inv.status || "PENDING").toUpperCase();
                        const isPending = statusUpper === "PENDING";
                        const isAccepted = statusUpper === "ACCEPTED";
                        const isExpired = statusUpper === "EXPIRED";
                        const isRevoked = statusUpper === "REVOKED";

                        return (
                          <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-slate-900">{inv.email}</td>
                            <td className="py-3.5 px-4">
                              <Badge variant="outline" className="font-bold text-[10.5px]">
                                {inv.role}
                              </Badge>
                            </td>
                            <td className="py-3.5 px-4">
                              {isAccepted ? (
                                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10.5px] font-semibold gap-1">
                                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                  ACCEPTED
                                </Badge>
                              ) : isExpired ? (
                                <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10.5px] font-semibold">
                                  EXPIRED
                                </Badge>
                              ) : isRevoked ? (
                                <Badge className="bg-rose-100 text-rose-700 border-rose-200 text-[10.5px] font-semibold">
                                  REVOKED
                                </Badge>
                              ) : (
                                <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10.5px] font-semibold gap-1">
                                  <Clock className="h-3 w-3 text-amber-600" />
                                  PENDING
                                </Badge>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-xs text-slate-500 font-medium">
                              {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : "—"}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              {isPending ? (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRevokeInvite(inv.id)}
                                  className="text-red-600 hover:bg-red-50 text-xs font-bold h-8 px-2.5 cursor-pointer"
                                >
                                  Revoke
                                </Button>
                              ) : isAccepted ? (
                                <span className="text-xs text-emerald-700 font-bold inline-flex items-center gap-1">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Joined
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400 font-medium">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500 text-xs font-semibold">
                  No {invitationStatusFilter === "ALL" ? "" : invitationStatusFilter.toLowerCase()} invitations found.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
