"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Send,
  Trophy,
  Brain,
  HelpCircle,
  LogOut,
  Building2,
  X,
  Shield,
  LifeBuoy,
  Settings,
  Crown,
  ChevronUp,
  Ticket,
} from "lucide-react";
import { useAuth } from "@/features/auth/context";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import AccountSettingsModal from "@/components/common/AccountSettingsModal/AccountSettingsModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const NAV_ITEMS = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    title: "Candidates",
    href: "/candidates",
    icon: Users,
  },
  {
    title: "Assessments",
    href: "/assessments",
    icon: FileText,
  },
  {
    title: "Invitations",
    href: "/invitations",
    icon: Send,
  },
  {
    title: "Results & Ranking",
    href: "/results",
    icon: Trophy,
  },
  {
    title: "Question Bank",
    href: "/question-bank",
    icon: HelpCircle,
  },
  {
    title: "Cognitive Games",
    href: "/games",
    icon: Brain,
  },
  {
    title: "Support",
    href: "/support",
    icon: LifeBuoy,
    exact: true,
  },
  {
    title: "Support Tickets",
    href: "/support-tickets",
    icon: Ticket,
    ownerOnly: true,
  },
  {
    title: "Company & Team",
    href: "/company",
    icon: Building2,
    ownerOnly: true,
  },
];

export default function Sidebar({ isOpen, onClose, impersonatedCompany }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const [dynamicLogo, setDynamicLogo] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("companyLogo") : null
  );
  const [dynamicName, setDynamicName] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("companyName") : null
  );

  useEffect(() => {
    const handleCompanyUpdate = () => {
      if (typeof window !== "undefined") {
        setDynamicLogo(localStorage.getItem("companyLogo"));
        setDynamicName(localStorage.getItem("companyName"));
      }
    };

    window.addEventListener("companyLogoUpdated", handleCompanyUpdate);
    window.addEventListener("companyUpdated", handleCompanyUpdate);
    window.addEventListener("userProfileUpdated", handleCompanyUpdate);
    window.addEventListener("storage", handleCompanyUpdate);
    return () => {
      window.removeEventListener("companyLogoUpdated", handleCompanyUpdate);
      window.removeEventListener("companyUpdated", handleCompanyUpdate);
      window.removeEventListener("userProfileUpdated", handleCompanyUpdate);
      window.removeEventListener("storage", handleCompanyUpdate);
    };
  }, []);

  const activeCompanyRole =
    user?.activeCompany?.role ||
    user?.companies?.[0]?.role ||
    user?.companyRole ||
    (user?.isOwner ? "OWNER" : "") ||
    (typeof window !== "undefined" ? localStorage.getItem("active_company_role") || localStorage.getItem("companyRole") : "") ||
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

  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (item.ownerOnly && !isOwnerOrAdmin) {
      return false;
    }
    return true;
  });

  const resolveDisplayName = (u) => {
    if (!u) return "User";
    if (typeof u === "string") return u;
    if (typeof u.name === "string" && u.name.trim()) return u.name.trim();
    if (typeof u.fullName === "string" && u.fullName.trim()) return u.fullName.trim();
    if (typeof u.firstName === "string" || typeof u.lastName === "string") {
      const full = `${u.firstName || ""} ${u.lastName || ""}`.trim();
      if (full) return full;
    }
    if (typeof u.email === "string" && u.email.trim()) {
      return u.email.split("@")[0];
    }
    return "User";
  };

  const getInitials = (name) => {
    const str = String(name || "HR").trim();
    if (!str) return "HR";
    const parts = str.split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
  };

  const displayName = resolveDisplayName(user);
  const userEmail = typeof user?.email === "string" ? user.email : "";
  const companyLogo =
    dynamicLogo ||
    (typeof window !== "undefined" ? localStorage.getItem("companyLogo") : null) ||
    user?.companyLogo ||
    user?.company?.logo ||
    impersonatedCompany?.logo ||
    null;
  const companyName =
    impersonatedCompany?.name ||
    dynamicName ||
    (typeof window !== "undefined" ? localStorage.getItem("companyName") : null) ||
    user?.companyName ||
    user?.company?.name ||
    (typeof user?.company === "string" ? user.company : null) ||
    "";
  const companyDomain =
    user?.companyDomain ||
    user?.company?.domain ||
    user?.domain ||
    (typeof window !== "undefined" ? localStorage.getItem("companyDomain") : null) ||
    "";

  const getCompanyInitials = (name) => {
    const str = String(name || "").trim();
    if (!str) return "HQ";
    const parts = str.split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
  };

  const activeCompanyName = companyName;
  const activePlan = impersonatedCompany?.plan || "Enterprise";
  const isInspecting = Boolean(impersonatedCompany);

  const isActive = (item) => {
    if (item.exact) {
      return pathname === item.href;
    }
    if (item.href === "/support-tickets") {
      return pathname === "/support-tickets" || pathname.startsWith("/company/support");
    }
    return pathname.startsWith(item.href);
  };

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col bg-white text-slate-800 border-r border-slate-200/90 transition-transform duration-300 ease-in-out lg:static lg:h-full lg:translate-x-0 shrink-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* ── 1. Top Dynamic Company Workspace Header (Light Glassmorphic Capsule) ── */}
        <div className="h-[64px] min-h-[64px] max-h-[64px] shrink-0 flex items-center justify-between px-3 border-b border-slate-100/90 bg-white">
          <div className="relative flex items-center gap-3 w-full h-[50px] px-2.5 rounded-[22px] bg-gradient-to-b from-white/95 via-slate-50/90 to-slate-100/80 border border-slate-200/70 shadow-[0_4px_16px_rgba(15,23,42,0.06)] backdrop-blur-md transition-all duration-200 group min-w-0 flex-1">
            {/* Elevated Clean White Logo Box */}
            <div className="h-[38px] w-[38px] rounded-[16px] bg-white border border-slate-200/80 p-1.5 flex items-center justify-center shrink-0 shadow-xs group-hover:shadow-sm transition-all overflow-hidden">
              {companyLogo ? (
                <img
                  src={companyLogo}
                  alt={companyName || "Company Logo"}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 font-extrabold text-xs text-white">
                  {getCompanyInitials(companyName)}
                </div>
              )}
            </div>

            {/* Company Name Typography */}
            <div className="min-w-0 flex-1">
              <span
                className="font-extrabold text-[14px] text-slate-900 tracking-tight leading-tight truncate block group-hover:text-slate-800 transition-colors"
                title={companyName || "HireQuest"}
              >
                {companyName || "HireQuest"}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden ml-2 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg shrink-0"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── 2. Navigation Links ── */}
        <nav className="flex-1 px-3 py-3.5 space-y-1.5 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);

            return (
              <Link
                key={item.title}
                href={item.href}
                prefetch={false}
                onClick={onClose}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 ${
                    active ? "text-white" : "text-slate-400"
                  }`}
                />
                <span className="truncate">{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* ── 3. Bottom Owner / User Profile (No Company Logo - Pure User Identity) ── */}
        <div className="relative p-3 border-t border-slate-200/90 bg-slate-50/70 shrink-0">
          {/* Popup Menu when clicking User Profile */}
          {isUserMenuOpen && (
            <div className="absolute bottom-full left-3 right-3 mb-2 rounded-2xl bg-white border border-slate-200/90 shadow-xl shadow-slate-200/60 p-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 font-sans space-y-1">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                <p className="text-[10px] text-slate-500 truncate">{userEmail}</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  setShowAccountSettings(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition cursor-pointer text-left"
              >
                <Settings className="h-4 w-4 text-slate-500" />
                <span>Account Settings</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  setShowLogoutConfirm(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer text-left"
              >
                <LogOut className="h-4 w-4 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          {/* Trigger Card: Owner Initials + Name + Role */}
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className="w-full flex items-center justify-between gap-2.5 p-1 rounded-xl hover:bg-slate-200/60 transition cursor-pointer text-left"
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {/* User Avatar with Initials (No company logo) */}
              <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {getInitials(displayName)}
              </div>

              {/* Owner Name & Role */}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate leading-tight">
                  {displayName}
                </p>
                <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                  {isOwnerOrAdmin ? "Company Owner" : "Recruiter"}
                </p>
              </div>
            </div>

            <ChevronUp
              className={`h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                isUserMenuOpen ? "rotate-180 text-slate-700" : ""
              }`}
            />
          </button>
        </div>
      </aside>

      {/* ── Account Settings Modal ── */}
      <AccountSettingsModal
        isOpen={showAccountSettings}
        onClose={() => setShowAccountSettings(false)}
      />

      {/* ── Logout Confirmation Dialog Modal ── */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6">
          <DialogHeader className="space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
              <LogOut className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-lg font-extrabold text-slate-900">
              Confirm Sign Out
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-slate-500">
              Are you sure you want to log out of your account? You will need to sign in again to access the portal.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4 sm:justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowLogoutConfirm(false)}
              className="w-full sm:w-auto h-10 px-5 rounded-xl border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={async () => {
                try {
                  setIsLoggingOut(true);
                  await logout();
                  toast.success("Logged out successfully.");
                  setShowLogoutConfirm(false);
                } catch {
                  setShowLogoutConfirm(false);
                } finally {
                  setIsLoggingOut(false);
                }
              }}
              disabled={isLoggingOut}
              className="w-full sm:w-auto h-10 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              {isLoggingOut ? "Signing Out..." : "Yes, Sign Out"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
