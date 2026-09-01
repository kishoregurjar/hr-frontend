"use client";

import { useState } from "react";
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
import { changePasswordApi, logoutAllApi } from "@/lib/api/auth";
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
  const [activeTab, setActiveTab] = useState("security"); // 'profile' | 'security' | 'sessions'

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  // Logout All Devices State
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

  const rawName = user?.name || user?.fullName || "HR Manager";
  const userName = rawName.replace(/\s+user$/i, "").trim() || "HR Manager";
  const userEmail = user?.email || "hr@mindersworld.com";
  const companyName = user?.company || "HireQuest HR";
  const userRole = user?.role || "HR";

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
      <DialogContent className="max-w-xl p-0 overflow-hidden rounded-3xl border-slate-200 shadow-2xl font-sans bg-white">
        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 text-white relative">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center font-bold text-base shadow-inner">
              <Shield className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-extrabold text-white tracking-tight">
                Account & Security Settings
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-300 mt-0.5">
                Manage your profile credentials, password security, and active login sessions.
              </DialogDescription>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => { setActiveTab("profile"); setPasswordError(null); }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "profile"
                  ? "bg-white text-slate-900 shadow-md"
                  : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              Profile
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab("security"); setPasswordError(null); }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "security"
                  ? "bg-white text-slate-900 shadow-md"
                  : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <KeyRound className="h-3.5 w-3.5" />
              Change Password
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab("sessions"); setPasswordError(null); }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "sessions"
                  ? "bg-white text-slate-900 shadow-md"
                  : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <Laptop className="h-3.5 w-3.5" />
              Active Sessions
            </button>
          </div>
        </div>

        {/* ── Tab Contents ── */}
        <div className="p-6">
          {/* TAB 1: PROFILE INFO */}
          {activeTab === "profile" && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-500/20">
                  {userName.charAt(0)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-slate-900">{userName}</h3>
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-extrabold">
                      {userRole}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{userEmail}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                  <span className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    Organization
                  </span>
                  <p className="font-bold text-slate-800 text-sm">{companyName}</p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                  <span className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    Account Role
                  </span>
                  <p className="font-bold text-slate-800 text-sm">Recruiter / Admin</p>
                </div>
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
