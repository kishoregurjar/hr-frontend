"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
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
  X,
  Loader2,
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

    const trimmedCurrent = currentPassword.trim();
    const trimmedNew = newPassword;
    const trimmedConfirm = confirmPassword;

    if (!trimmedCurrent) {
      setPasswordError("Please enter your current password.");
      return;
    }

    if (!trimmedNew) {
      setPasswordError("Please enter a new password.");
      return;
    }

    if (trimmedNew.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }

    if (trimmedNew.length > 64) {
      setPasswordError("New password cannot exceed 64 characters.");
      return;
    }

    if (!/[A-Z]/.test(trimmedNew)) {
      setPasswordError("New password must contain at least one uppercase letter (A-Z).");
      return;
    }

    if (!/[a-z]/.test(trimmedNew)) {
      setPasswordError("New password must contain at least one lowercase letter (a-z).");
      return;
    }

    if (!/\d/.test(trimmedNew)) {
      setPasswordError("New password must contain at least one number (0-9).");
      return;
    }

    if (!/[@$!%*?#&^()_\-+=]/.test(trimmedNew)) {
      setPasswordError("New password must contain at least one special character (e.g. @, #, $, %, !, &).");
      return;
    }

    if (trimmedCurrent === trimmedNew) {
      setPasswordError("New password cannot be the same as your current password.");
      return;
    }

    if (trimmedNew !== trimmedConfirm) {
      setPasswordError("New password and confirmation password do not match.");
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePasswordApi({ currentPassword: trimmedCurrent, newPassword: trimmedNew });
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onClose();
    } catch (err) {
      const errCode = err?.response?.data?.code || err?.code;
      const details = err?.response?.data?.details || err?.details;
      const firstDetail = Array.isArray(details) && details[0]?.message ? details[0].message : null;
      const rawMsg = firstDetail || err?.response?.data?.message || err?.message || "";

      let friendlyMsg = rawMsg;
      if (
        errCode === "INCORRECT_CURRENT_PASSWORD" ||
        rawMsg.toLowerCase().includes("current password is incorrect") ||
        rawMsg.toLowerCase().includes("current password")
      ) {
        friendlyMsg = "Your current password is incorrect. Please check and try again.";
      } else if (errCode === "SAME_PASSWORD" || rawMsg.toLowerCase().includes("same as your current password")) {
        friendlyMsg = "New password cannot be the same as your current password.";
      } else if (rawMsg === "Request validation failed." || !rawMsg) {
        friendlyMsg = firstDetail || "Password validation failed. Please check the requirements below.";
      }

      setPasswordError(friendlyMsg);
      toast.error(friendlyMsg);
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
      <DialogContent className="max-w-xl p-0 overflow-hidden rounded-3xl border border-white/90 shadow-2xl font-sans bg-white max-h-[92vh] flex flex-col">
        {/* ── 1. Top Hero Header with 3D Parallax Gradient ── */}
        <div className="shrink-0 bg-gradient-to-r from-[#4E35E8] via-[#6D38F0] to-[#CF2E9F] p-6 text-white rounded-t-3xl relative overflow-hidden select-none shadow-md">
          {/* Subtle Ambient 3D Glow Accents */}
          <div className="absolute -top-14 -right-14 h-40 w-40 rounded-full bg-white/15 blur-2xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/3 h-20 w-20 rounded-full bg-pink-300/10 blur-xl pointer-events-none" />

          {/* Close Button on Top Right */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer z-20"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3.5 relative z-10 pr-8">
            <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center font-bold shadow-inner shrink-0">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-xl font-extrabold text-white tracking-tight drop-shadow-xs">
                  HR Profile & Account Settings
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-white/85 mt-0.5 font-medium">
                Manage recruiter profile credentials, account security, and active sessions.
              </DialogDescription>
            </div>
          </div>

          {/* Modern Segmented Pill Tabs */}
          <div className="flex items-center gap-1.5 mt-5 p-1 bg-black/15 backdrop-blur-md rounded-2xl border border-white/20 relative z-10">
            <button
              type="button"
              onClick={() => { setActiveTab("profile"); setPasswordError(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "profile"
                  ? "bg-white text-indigo-700 shadow-md"
                  : "text-white/80 hover:text-white hover:bg-white/10"
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
                  ? "bg-white text-indigo-700 shadow-md"
                  : "text-white/80 hover:text-white hover:bg-white/10"
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
                  ? "bg-white text-indigo-700 shadow-md"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <Laptop className="h-3.5 w-3.5" />
              Active Sessions
            </button>
          </div>
        </div>

        {/* ── 2. Tab Contents ── */}
        <div className="p-6 pt-5 overflow-y-auto flex-1 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* TAB 1: PROFILE INFO */}
          {activeTab === "profile" && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-50/60 via-purple-50/40 to-slate-50 border border-indigo-100/80 shadow-2xs">
                <div className="h-13 w-13 rounded-2xl bg-gradient-to-br from-[#4E35E8] to-[#CF2E9F] text-white flex items-center justify-center font-black text-base shadow-md shadow-indigo-500/20 shrink-0">
                  {String(userName || "HR").slice(0, 2).toUpperCase()}
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-base text-slate-900 truncate">{userName}</h3>
                    <Badge className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-2xs ${
                      user?.isOwner || userRole === "Company Owner" || userRole === "OWNER"
                        ? "bg-amber-100 text-amber-900 border border-amber-300"
                        : userRole === "HR Admin" || userRole === "ADMIN"
                        ? "bg-purple-100 text-purple-900 border border-purple-300"
                        : "bg-indigo-100 text-indigo-900 border border-indigo-300"
                    }`}>
                      {userRole}
                    </Badge>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      Verified
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 font-medium truncate">{userEmail}</p>
                </div>
              </div>

              {/* Full Name Edit Section */}
              <form onSubmit={handleUpdateName} className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/60 space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-indigo-600" />
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
                        placeholder="Enter your full name"
                        className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-2xs"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isSavingName || !nameInput.trim() || nameInput.trim() === userName}
                      className="h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all disabled:opacity-40 cursor-pointer shrink-0"
                    >
                      {isSavingName ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                          Saving...
                        </>
                      ) : (
                        "Save Name"
                      )}
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
                <div className="p-3.5 rounded-2xl border border-slate-200/90 bg-white space-y-1 hover:border-indigo-200 transition-colors shadow-2xs">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-indigo-600" />
                    Organization
                  </span>
                  <p className="font-bold text-slate-800 text-sm truncate">{companyName}</p>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200/90 bg-white space-y-1 hover:border-indigo-200 transition-colors shadow-2xs">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    Account Role
                  </span>
                  <p className="font-bold text-slate-800 text-sm">
                    {userRole}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("security")}
                  className="h-10 px-4 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 gap-1.5 cursor-pointer shadow-2xs"
                >
                  <KeyRound className="h-3.5 w-3.5 text-indigo-600" />
                  Change Password
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={onClose}
                  className="h-10 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 cursor-pointer transition-all"
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
                    onChange={(e) => {
                      setCurrentPassword(e.target.value);
                      if (passwordError) setPasswordError(null);
                    }}
                    placeholder="Enter your current password"
                    required
                    className="w-full h-10 pl-10 pr-10 rounded-xl border border-slate-200 bg-slate-50/60 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords((p) => !p)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
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
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (passwordError) setPasswordError(null);
                    }}
                    placeholder="Min 8 characters (e.g. Developer123#)"
                    required
                    className="w-full h-10 pl-10 pr-10 rounded-xl border border-slate-200 bg-slate-50/60 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-2xs"
                  />
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Must include at least 8 characters with uppercase, lowercase, a number and a symbol.
                </p>
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
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (passwordError) setPasswordError(null);
                    }}
                    placeholder="Re-enter your new password"
                    required
                    className="w-full h-10 pl-10 pr-10 rounded-xl border border-slate-200 bg-slate-50/60 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-2xs"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="h-10 px-5 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer shadow-2xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isChangingPassword}
                  className="h-10 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 cursor-pointer transition-all"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* TAB 3: SESSIONS & LOGOUT ALL */}
          {activeTab === "sessions" && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-2">
                    <Laptop className="h-4 w-4 text-indigo-600" />
                    Current Active Session
                  </span>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-2xs">
                    This Browser
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500">
                  Signed in via JWT Token Authentication with encrypted HttpOnly cookie storage.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/60 space-y-3 shadow-2xs">
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
                  className="h-10 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs gap-1.5 shadow-sm shadow-rose-500/20 cursor-pointer transition-all"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  {isLoggingOutAll ? "Signing out..." : "Sign Out of All Devices"}
                </Button>
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="h-10 px-6 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer shadow-2xs"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
