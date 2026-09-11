"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/features/auth/context";
import { changePasswordApi, logoutAllApi, updateUserProfileApi } from "@/lib/api/auth";
import { toast } from "sonner";
import {
  Shield,
  KeyRound,
  Laptop,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  LogOut,
  User,
  Building2,
  Sparkles,
} from "lucide-react";

export default function AccountSettingsModal({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'security' | 'sessions'

  const rawName =
    (typeof user?.name === "string" ? user.name : "") ||
    (typeof user?.fullName === "string" ? user.fullName : "") ||
    "";
  const userName = String(rawName).replace(/\s+user$/i, "").trim() || (user?.email ? user.email.split("@")[0] : "HR User");
  const userEmail = user?.email || "";
  const companyName =
    user?.companyName ||
    user?.company?.name ||
    user?.company ||
    (typeof window !== "undefined" ? localStorage.getItem("companyName") : null) ||
    "";
  const userRole = user?.role || "HR";

  // Profile Edit State
  const [nameInput, setNameInput] = useState(userName);
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameError, setNameError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setNameInput(userName);
      setNameError(null);
      setPasswordError(null);
    }
  }, [isOpen, userName]);

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  // Logout All Devices State
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

  const handleUpdateName = async (e) => {
    e?.preventDefault();
    setNameError(null);
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed.length < 2) {
      setNameError("Name must be at least 2 characters long.");
      return;
    }

    setIsSavingName(true);
    try {
      await updateUserProfileApi({ name: trimmed });
      toast.success("Profile name updated successfully!");
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to update profile name.";
      setNameError(msg);
      toast.error(msg);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePasswordApi({ currentPassword, newPassword });
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onClose();
    } catch (err) {
      setPasswordError(err.message || "Failed to update password. Please check your current password.");
      toast.error(err.message || "Failed to update password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogoutAll = async () => {
    if (!confirm("Are you sure you want to log out of all active sessions and devices?")) {
      return;
    }

    setIsLoggingOutAll(true);
    try {
      await logoutAllApi();
      toast.success("Signed out of all devices.");
      onClose();
      window.location.href = "/login";
    } catch (err) {
      toast.error(err.message || "Failed to sign out of all devices.");
    } finally {
      setIsLoggingOutAll(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-0 overflow-hidden rounded-3xl border-slate-200/90 shadow-2xl font-sans bg-white">
        {/* ── Light Header Matching HireQuest UI ── */}
        <div className="p-6 pb-4 border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-blue-50 border border-blue-100/80 text-blue-600 flex items-center justify-center font-bold shadow-xs">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-extrabold text-slate-900 tracking-tight">
                HR Profile & Account Settings
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Manage recruiter profile credentials, account security, and active sessions.
              </DialogDescription>
            </div>
          </div>

          {/* Modern Segmented Pill Tabs */}
          <div className="flex items-center gap-1.5 mt-5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/60">
            <button
              type="button"
              onClick={() => { setActiveTab("profile"); setPasswordError(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "profile"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              Profile Details
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab("security"); setPasswordError(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "security"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <KeyRound className="h-3.5 w-3.5" />
              Change Password
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab("sessions"); setPasswordError(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "sessions"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Laptop className="h-3.5 w-3.5" />
              Active Sessions
            </button>
          </div>
        </div>

        {/* ── Tab Contents ── */}
        <div className="p-6 pt-5">
          {/* TAB 1: PROFILE INFO */}
          {activeTab === "profile" && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-slate-50 border border-blue-100/80">
                <div className="h-13 w-13 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-base shadow-md shadow-blue-500/20 shrink-0">
                  {String(userName || "HR").slice(0, 2).toUpperCase()}
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-base text-slate-900 truncate">{userName}</h3>
                    <Badge className={`text-[10px] font-extrabold px-2 py-0.5 shadow-xs ${
                      user?.isOwner || userRole === "Company Owner" || userRole === "OWNER"
                        ? "bg-amber-100 text-amber-900 border border-amber-300"
                        : userRole === "HR Admin" || userRole === "ADMIN"
                        ? "bg-purple-100 text-purple-900 border border-purple-300"
                        : "bg-blue-100 text-blue-900 border border-blue-300"
                    }`}>
                      {userRole}
                    </Badge>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-extrabold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 font-medium truncate">{userEmail}</p>
                </div>
              </div>

              {/* Full Name Edit Section */}
              <form onSubmit={handleUpdateName} className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-blue-600" />
                      Full Name
                    </label>
                    <span className="text-[11px] font-medium text-slate-400">
                      Displayed on sidebar, invites & evaluations
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => {
                          setNameInput(e.target.value);
                          if (nameError) setNameError(null);
                        }}
                        placeholder="Enter your full name (e.g. Shivam Singh)"
                        className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition shadow-2xs"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isSavingName || !nameInput.trim() || nameInput.trim() === userName}
                      className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-40 cursor-pointer shrink-0"
                    >
                      {isSavingName ? "Saving..." : "Save Name"}
                    </Button>
                  </div>
                  {nameError && (
                    <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {nameError}
                    </p>
                  )}
                </div>
              </form>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl border border-slate-200/90 bg-white space-y-1 hover:border-blue-200 transition-colors">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-blue-600" />
                    Organization
                  </span>
                  <p className="font-bold text-slate-800 text-sm truncate">{companyName}</p>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200/90 bg-white space-y-1 hover:border-blue-200 transition-colors">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    Account Role
                  </span>
                  <p className="font-bold text-slate-800 text-sm">
                    {userRole}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200/90 bg-white space-y-1 hover:border-blue-200 transition-colors">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-emerald-600" />
                    Security Verification
                  </span>
                  <p className="font-bold text-slate-800 text-sm">Brevo OTP Verified</p>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200/90 bg-white space-y-1 hover:border-blue-200 transition-colors">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-indigo-600" />
                    Encryption
                  </span>
                  <p className="font-bold text-slate-800 text-sm">256-Bit SSL Protected</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("security")}
                  className="rounded-xl border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 gap-1.5 cursor-pointer"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  Change Password
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={onClose}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 shadow-sm shadow-blue-500/20 cursor-pointer"
                >
                  Close
                </Button>
              </div>
            </div>
          )}

          {/* TAB 2: CHANGE PASSWORD */}
          {activeTab === "security" && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              {passwordError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{passwordError}</span>
                </div>
              )}

              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    required
                    className="w-full h-10 pl-10 pr-10 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords((p) => !p)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters (with letters & numbers)"
                    required
                    className="w-full h-10 pl-10 pr-10 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition shadow-2xs"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    required
                    className="w-full h-10 pl-10 pr-10 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition shadow-2xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="rounded-xl border-slate-200 text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isChangingPassword}
                  className="h-10 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  {isChangingPassword ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </form>
          )}

          {/* TAB 3: SESSIONS & LOGOUT ALL */}
          {activeTab === "sessions" && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-2">
                    <Laptop className="h-4 w-4 text-blue-600" />
                    Current Active Session
                  </span>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px] font-extrabold">
                    This Browser
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500">
                  Signed in via JWT Token Authentication with encrypted HttpOnly cookie storage.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/60 space-y-3">
                <div>
                  <h4 className="font-bold text-sm text-rose-900 flex items-center gap-2">
                    <LogOut className="h-4 w-4 text-rose-600" />
                    Logout From All Devices
                  </h4>
                  <p className="text-xs text-rose-700/90 mt-0.5 leading-relaxed">
                    This will immediately revoke all active refresh tokens and sign you out across every browser, phone, and laptop.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="destructive"
                  disabled={isLoggingOutAll}
                  onClick={handleLogoutAll}
                  className="h-9 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs gap-1.5 shadow-sm shadow-rose-500/20 cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  {isLoggingOutAll ? "Signing out..." : "Sign Out of All Devices"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
