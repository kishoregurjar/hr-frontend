"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  LogOut,
  Menu,
  Shield,
  ShieldCheck,
  Crown,
  User,
  Building2,
  Mail,
  Settings,
  KeyRound,
  ChevronDown,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { PAGE_TITLES } from "@/constants";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/features/auth/context";
import { toast } from "sonner";
import AccountSettingsModal from "@/components/common/AccountSettingsModal/AccountSettingsModal";

const PAGE_SUBTITLES = {
  "/dashboard": "HireQuest Recruitment & Cognitive Candidate Screening Overview",
  "/candidates": "Candidate Pipeline, Talent Profiles & Assessment Tracking",
  "/assessments": "Manage Cognitive & Skill-Based Assessment Modules",
  "/invitations": "Candidate Dispatched Test Links & Live Status",
  "/results": "Evaluation Leaderboard, Cheat Detection & Ranking",
  "/questions": "Comprehensive Question Bank & Evaluation Metrics",
  "/games": "Interactive Cognitive & Behavioral Game Engine",
  "/company": "Manage Organization, Team Members & Workspace Roles",
};

const Navbar = ({ onMenuClick, impersonatedCompany = null }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const menuRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const pageTitle = PAGE_TITLES[pathname] || "Dashboard";
  const pageSubtitle = PAGE_SUBTITLES[pathname] || "Manage recruitment pipeline, candidate assessments, and evaluations";

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success("Logged out successfully.");
      setShowLogoutConfirm(false);
      router.push("/login");
    } catch {
      setShowLogoutConfirm(false);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const rawName =
    (typeof user?.name === "string" ? user.name : "") ||
    (typeof user?.fullName === "string" ? user.fullName : "") ||
    (user?.email ? user.email.split("@")[0] : "");
  const displayName = String(rawName).replace(/\s+user$/i, "").trim() || "User";
  const userEmail = typeof user?.email === "string" ? user.email : (typeof window !== "undefined" ? localStorage.getItem("user_email") || "" : "");
  const companyLogo =
    (typeof window !== "undefined" ? localStorage.getItem("companyLogo") : null) || user?.companyLogo || null;
  const companyName =
    user?.companyName ||
    user?.company?.name ||
    user?.company ||
    (typeof window !== "undefined" ? localStorage.getItem("companyName") : null) ||
    "";
  const activeCompanyRole =
    user?.activeCompany?.role ||
    user?.companies?.[0]?.role ||
    user?.companyRole ||
    (user?.isOwner ? "OWNER" : "") ||
    (typeof window !== "undefined" ? localStorage.getItem("active_company_role") || localStorage.getItem("companyRole") : "") ||
    user?.role ||
    "";

  const isOwnerUser = Boolean(
    user?.isOwner ||
    String(activeCompanyRole).toUpperCase() === "OWNER" ||
    String(activeCompanyRole).toUpperCase() === "COMPANY_OWNER" ||
    user?.companyRole === "OWNER" ||
    user?.role === "Company Owner"
  );
  const isAdminUser = Boolean(
    user?.isAdmin ||
    String(activeCompanyRole).toUpperCase() === "ADMIN" ||
    String(activeCompanyRole).toUpperCase() === "COMPANY_ADMIN" ||
    user?.companyRole === "ADMIN" ||
    user?.role === "HR Admin"
  );
  const userRole = isOwnerUser ? "Company Owner" : isAdminUser ? "HR Admin" : "Recruiter";
  const badgeLabel = isOwnerUser ? "Owner" : isAdminUser ? "Admin" : "Recruiter";
  const badgeColor = isOwnerUser
    ? "bg-amber-50 text-amber-800 border-amber-200/80"
    : isAdminUser
    ? "bg-purple-50 text-purple-700 border-purple-200/80"
    : "bg-blue-50 text-blue-700 border-blue-200/80";

  const getInitials = (name) => {
    const str = String(name || "RP").trim();
    if (!str) return "RP";
    const clean = str.replace(/\s+user$/i, "").trim();
    const parts = clean.split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
  };

  return (
    <>
      <header className="min-h-16 border-b border-slate-200/80 bg-white px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between sticky top-0 z-30 font-sans shadow-2xs gap-3">
        {/* Left Section: Mobile Menu + Page Title & Subtitle Matching AdminHeader */}
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden p-2 h-9 w-9 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition shrink-0 border border-slate-200/80 cursor-pointer"
            aria-label="Open Mobile Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight truncate">
                {pageTitle}
              </h1>

              {/* Impersonation Banner for Super Admin */}
              {impersonatedCompany ? (
                <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-extrabold text-[10px] sm:text-[10.5px] gap-1 shrink-0 shadow-2xs">
                  <ShieldCheck className="h-3 w-3 text-amber-600" />
                  Impersonating: {impersonatedCompany.name}
                </Badge>
              ) : (
                <Badge className={`text-[10px] sm:text-[10.5px] font-extrabold gap-1 shrink-0 ${badgeColor}`}>
                  {isOwnerUser ? <Crown className="h-3 w-3 text-amber-600" /> : <ShieldCheck className="h-3 w-3 text-blue-600" />}
                  {badgeLabel}
                </Badge>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5 truncate max-w-xs sm:max-w-md md:max-w-none">
              {pageSubtitle}
            </p>
          </div>
        </div>

        {/* Right Section: Notifications + User Profile Menu Matching AdminHeader */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Notifications Trigger */}
          <button
            type="button"
            className="relative p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-slate-200/80 transition-all cursor-pointer shadow-2xs"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
          </button>

          {/* ── Interactive HR Profile Menu ── */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 shadow-2xs transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              aria-label="User profile menu"
              aria-expanded={isProfileMenuOpen}
            >
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                {getInitials(displayName)}
              </div>

              <div className="hidden sm:block text-left">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    {displayName}
                  </p>
                </div>
                <p className="text-[10px] text-slate-500 font-medium truncate max-w-[140px]">
                  {companyName || userEmail}
                </p>
              </div>

              <ChevronDown
                className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                  isProfileMenuOpen ? "rotate-180 text-slate-700" : ""
                }`}
              />
            </button>

            {/* ── Floating Profile Dropdown Card Matching AdminHeader ── */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl shadow-slate-200/60 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* User Header */}
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {displayName}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium truncate">
                    {userEmail}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9.5px] font-extrabold tracking-wider uppercase border ${badgeColor}`}>
                      {isOwnerUser ? <Crown className="h-2.5 w-2.5" /> : <Shield className="h-2.5 w-2.5" />}
                      {userRole}
                    </span>
                    {companyName && (
                      <span className="text-[10px] font-bold text-slate-600 truncate max-w-[120px]">
                        • {companyName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Menu Actions */}
                <div className="space-y-0.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setShowAccountSettings(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl transition-all cursor-pointer text-left"
                  >
                    <Settings className="h-4 w-4 text-slate-400" />
                    <span>Account Settings & Password</span>
                  </button>

                  {(isOwnerUser || isAdminUser) && (
                    <Link
                      href="/company"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl transition-all cursor-pointer text-left"
                    >
                      <Building2 className="h-4 w-4 text-slate-400" />
                      <span>Company & Team Settings</span>
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setShowLogoutConfirm(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer text-left border-t border-slate-100 mt-1 pt-2"
                  >
                    <LogOut className="h-4 w-4 text-rose-500" />
                    <span>Sign Out Account</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Account Settings Modal ── */}
      <AccountSettingsModal
        isOpen={showAccountSettings}
        onClose={() => setShowAccountSettings(false)}
      />

      {/* ── Logout Confirmation Dialog Modal ── */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="max-w-md p-6 sm:rounded-2xl">
          <DialogHeader className="flex flex-col items-center text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20">
              <LogOut className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Confirm Logout
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600 max-w-xs leading-relaxed">
              Are you sure you want to log out of your <span className="font-semibold text-slate-700">{companyName}</span> account? You will need to sign in again to access the dashboard.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowLogoutConfirm(false)}
              className="w-full sm:w-1/2 font-semibold"
              disabled={isLoggingOut}
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmLogout}
              className="w-full sm:w-1/2 font-semibold bg-red-600 hover:bg-red-700 text-white"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Logging Out..." : "Sign Out"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Navbar;
