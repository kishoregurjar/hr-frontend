"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  LogOut,
  Menu,
  Shield,
  ShieldCheck,
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
    ? "bg-amber-50 text-amber-700 border-amber-200"
    : isAdminUser
    ? "bg-purple-50 text-purple-700 border-purple-200"
    : "bg-blue-50 text-blue-700 border-blue-200";

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
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur-md px-4 md:px-6 shadow-xs">
        {/* Left Section: Mobile Menu + Page Title */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden h-9 w-9 text-slate-600 hover:text-slate-900"
            aria-label="Open Mobile Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2.5">
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
              {pageTitle}
            </h1>

            {/* Impersonation Banner for Super Admin */}
            {impersonatedCompany && (
              <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-extrabold text-[10px] gap-1 shadow-2xs">
                <ShieldCheck className="h-3 w-3 text-amber-600" />
                Impersonating: {impersonatedCompany.name}
              </Badge>
            )}
          </div>
        </div>

        {/* Right Section: Notifications + Quick Actions + User Menu */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Notifications Trigger */}
          <button
            type="button"
            className="relative p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
          </button>

          {/* ── Interactive HR Profile Menu ── */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2.5 p-1.5 pl-2 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-slate-100 transition-all cursor-pointer shadow-xs focus:ring-2 focus:ring-blue-600/20"
              title="View HR Profile"
            >
              <Avatar className="h-8 w-8 rounded-lg shadow-xs">
                <AvatarFallback className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>

              <div className="hidden md:block text-left mr-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    {displayName}
                  </p>
                  <span className={`px-1.5 py-0.2 rounded border text-[9px] font-extrabold uppercase ${badgeColor}`}>
                    {badgeLabel}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  {companyLogo && (
                    <img
                      src={companyLogo}
                      alt={companyName}
                      className="h-3.5 w-3.5 rounded object-contain bg-white border border-slate-200"
                    />
                  )}
                  <p className="text-[11px] text-blue-600 font-bold truncate max-w-[130px]">
                    {companyName}
                  </p>
                </div>
              </div>

              <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${isProfileMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {/* ── Floating HR Profile Dropdown Card ── */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl border bg-card p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 space-y-4">
                {/* User Header */}
                <div className="flex items-center gap-3 pb-3 border-b">
                  <Avatar className="h-10 w-10 rounded-xl shadow-xs">
                    <AvatarFallback className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-sm">
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-extrabold text-slate-900 truncate">
                        {displayName}
                      </p>
                      <span className={`px-1.5 py-0.2 rounded border text-[9px] font-extrabold uppercase shrink-0 ${badgeColor}`}>
                        {badgeLabel}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5" title={userEmail}>
                      <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                      <span className="truncate">{userEmail}</span>
                    </p>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="space-y-2 text-xs bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                      {companyLogo ? (
                        <img
                          src={companyLogo}
                          alt={companyName}
                          className="h-4 w-4 rounded-sm object-contain bg-white border border-slate-200"
                        />
                      ) : (
                        <Building2 className="h-3.5 w-3.5 text-blue-600" />
                      )}
                      Company:
                    </span>
                    <span className="font-bold text-slate-900 truncate max-w-[130px]">{companyName}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                      <Shield className="h-3.5 w-3.5 text-blue-600" />
                      Role:
                    </span>
                    <Badge variant="outline" className={`text-[10px] font-extrabold py-0 h-5 ${badgeColor}`}>
                      {userRole}
                    </Badge>
                  </div>
                </div>

                {/* Menu Actions */}
                <div className="space-y-1 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setShowAccountSettings(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50/80 rounded-xl transition-all cursor-pointer text-left"
                  >
                    <Settings className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
                    Account Settings & Password
                  </button>

                  {(isOwnerUser || isAdminUser) && (
                    <Link
                      href="/company"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50/80 rounded-xl transition-all cursor-pointer text-left"
                    >
                      <Building2 className="h-4 w-4 text-slate-400" />
                      Company & Team Settings
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setShowLogoutConfirm(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer text-left border-t border-slate-100 mt-1 pt-2"
                  >
                    <LogOut className="h-4 w-4 text-rose-500" />
                    Sign Out Account
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
