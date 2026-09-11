"use client";

import { useState } from "react";
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
  Settings,
  Shield,
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
    (typeof window !== "undefined" ? localStorage.getItem("companyLogo") : null) ||
    user?.companyLogo ||
    null;
  const companyName =
    (typeof window !== "undefined" ? localStorage.getItem("companyName") : null) ||
    user?.companyName ||
    user?.company?.name ||
    user?.company ||
    "";
  const activeCompanyName = companyName;
  const activePlan = impersonatedCompany?.plan || "Enterprise";
  const isInspecting = Boolean(impersonatedCompany);

  const isActive = (item) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  const handleConfirmLogout = async () => {
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
  };

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col bg-white text-slate-800 border-r border-slate-200/90 transition-transform duration-300 ease-in-out lg:static lg:h-full lg:translate-x-0 shrink-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* ── 1. Top Logo Header ── */}
        <div className="h-16 flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 font-extrabold text-sm text-white shadow-md shadow-blue-500/20">
              HQ
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 leading-none block">
                HireQuest
              </span>
              <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                Recruitment Workspace
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── 2. Navigation Links ── */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);

            return (
              <Link
                key={item.title}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    active ? "text-white" : "text-slate-400"
                  }`}
                />
                <span className="truncate">{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* ── 4. User Footer with Settings and Logout Button (Only on Mobile View) ── */}
        <div className="p-3 border-t border-slate-200/80 flex items-center justify-between bg-slate-50/50 lg:hidden">
          <button
            type="button"
            onClick={() => setShowAccountSettings(true)}
            className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-80 transition cursor-pointer flex-1 mr-2"
            title="Account & Security Settings"
          >
            <div className="h-8 w-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              {getInitials(displayName)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate leading-none">
                {displayName}
              </p>
              <p className="text-[10px] text-slate-500 truncate mt-1">
                {userEmail}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setShowAccountSettings(true)}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
              title="Account & Security Settings"
              aria-label="Account Settings"
            >
              <Settings className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Account & Security Settings Modal ── */}
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
              Are you sure you want to log out of your <span className="font-semibold text-slate-700">{companyName}</span> account? You will need to sign in again to access the candidate screening portal.
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
              onClick={handleConfirmLogout}
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
