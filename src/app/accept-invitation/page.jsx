"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Building2,
  Sparkles,
  Lock,
  Mail,
  LogIn,
  UserPlus,
  LogOut,
  Eye,
  EyeOff,
  User,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import {
  acceptCompanyInvitation,
  verifyCompanyInvitation,
  acceptAndRegisterCompanyInvitation,
} from "@/lib/api/company";
import { loginApi, setAuthSession } from "@/lib/api/auth";
import { AUTH_STORAGE_KEYS } from "@/features/auth/constants";
import { useAuth } from "@/features/auth/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

function AcceptInvitationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();

  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(true);
  const [invitationData, setInvitationData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // In-Place Form States
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isExistingUserMode, setIsExistingUserMode] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successCompany, setSuccessCompany] = useState("");

  // 1. Verify invitation token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token || token.trim().length === 0) {
        setTokenValid(false);
        setErrorMessage("Invitation token is missing from the URL.");
        setIsVerifying(false);
        return;
      }

      try {
        const data = await verifyCompanyInvitation(token);
        const payload = data?.data || data;
        setInvitationData(payload);
        setTokenValid(true);
        const isExisting = payload?.isExistingUser === true || payload?.isNewUser === false;
        setIsExistingUserMode(isExisting);
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "This invitation link is invalid or has already been accepted.";
        setErrorMessage(msg);
        setTokenValid(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  // Helper to store tokens in localStorage
  const saveAuthSession = (authPayload) => {
    const accessToken =
      authPayload?.accessToken ||
      authPayload?.token ||
      authPayload?.data?.accessToken ||
      authPayload?.data?.token;

    const refreshToken =
      authPayload?.refreshToken ||
      authPayload?.data?.refreshToken;

    const userData =
      authPayload?.user ||
      authPayload?.data?.user;

    if (typeof window !== "undefined" && accessToken) {
      const userToStore = userData || {};
      if (invitationData?.companyId) userToStore.companyId = invitationData.companyId;
      if (invitationData?.companyName) userToStore.companyName = invitationData.companyName;

      setAuthSession(accessToken, userToStore, refreshToken);
    }
  };

  // 2A. In-Place Join Team for New User (Atomic Accept & Register)
  const handleNewUserJoin = async (e) => {
    e.preventDefault();
    if (!token) return;

    if (!name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await acceptAndRegisterCompanyInvitation({
        token,
        name: name.trim(),
        password,
      });

      const payload = response?.data || response;
      saveAuthSession(payload);

      setSuccessCompany(invitationData?.companyName || "the organization");
      setIsSuccess(true);
      toast.success("Account created & team invitation accepted successfully!");

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1200);
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to complete registration and join workspace.";
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2B. In-Place Join for Existing User with Password
  const handleExistingUserJoin = async (e) => {
    e.preventDefault();
    if (!token) return;

    if (!password) {
      toast.error("Please enter your account password.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Authenticate user
      const loginRes = await loginApi({
        email: invitationData?.email,
        password,
      });

      // 2. Accept invitation
      await acceptCompanyInvitation(token);

      setSuccessCompany(invitationData?.companyName || "the organization");
      setIsSuccess(true);
      toast.success("Welcome back! You have joined the workspace.");

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1200);
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Invalid password or failed to accept invitation.";
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2C. Direct 1-Click Accept for Already Logged-In User
  const handleDirectAccept = async () => {
    if (!token) return;

    setIsSubmitting(true);
    try {
      await acceptCompanyInvitation(token);
      setSuccessCompany(invitationData?.companyName || "the organization");
      setIsSuccess(true);
      toast.success("Team invitation accepted successfully!");

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1200);
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to accept invitation.";
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwitchAccount = async () => {
    try {
      await logout();
    } catch {}
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  // State 1: Verification Loading
  if (isVerifying || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100 shadow-xs">
          <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Verifying Invitation...</h2>
          <p className="text-xs text-slate-500 mt-1">Validating your workspace invitation details.</p>
        </div>
      </div>
    );
  }

  // State 2: Invalid or Expired Token
  if (!tokenValid) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-5">
        <div className="h-14 w-14 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-100 shadow-xs">
          <XCircle className="h-7 w-7 text-rose-600" />
        </div>
        <div className="space-y-1.5 max-w-sm">
          <h2 className="text-xl font-extrabold text-slate-900">Invalid or Expired Invitation</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {errorMessage || "This invitation link is no longer valid or has already been accepted."}
          </p>
        </div>

        <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-800 text-left space-y-1 w-full">
          <div className="font-bold flex items-center gap-1.5 text-amber-900">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            Need a New Link?
          </div>
          <p className="text-[11px] text-amber-700 leading-relaxed">
            Please ask your company workspace owner to re-send your recruiter team invitation.
          </p>
        </div>

        <div className="pt-2 w-full">
          <Link href="/login" className="block w-full">
            <Button
              variant="outline"
              className="w-full h-11 font-bold text-xs rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Return to Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // State 3: Successfully Accepted
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-5">
        <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-xs">
          <CheckCircle2 className="h-7 w-7 text-emerald-600" />
        </div>
        <div className="space-y-1.5 max-w-sm">
          <h2 className="text-xl font-extrabold text-slate-900">Invitation Accepted!</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            You are now officially a team member of <strong className="text-slate-800">{successCompany || "the organization"}</strong>. Redirecting you to your dashboard...
          </p>
        </div>

        <div className="pt-2 w-full">
          <Button
            onClick={() => { window.location.href = "/company"; }}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  const invitedEmail = invitationData?.email || "";
  const companyName = invitationData?.companyName || invitationData?.company?.name || invitationData?.company || "Company Workspace";
  const role = invitationData?.role || "RECRUITER";
  const isExistingUser = Boolean(invitationData?.isExistingUser);

  const userEmail = user?.email || "";
  const isEmailMatching =
    isAuthenticated &&
    userEmail &&
    invitedEmail &&
    userEmail.toLowerCase() === invitedEmail.toLowerCase();

  // State 4A: User is Logged-In with the Matching Invited Email -> Show 1-Click Accept
  if (isAuthenticated && isEmailMatching) {
    return (
      <div className="space-y-6">
        {/* Invitation Context Card */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 space-y-2.5 text-left">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-xs text-blue-900 flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-blue-600" />
              {companyName}
            </span>
            <Badge className="bg-blue-600 text-white font-extrabold text-[10px] tracking-wider uppercase px-2 py-0.5">
              {role}
            </Badge>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            You are logged in as <strong className="text-slate-900 font-bold">{userEmail}</strong>. Click below to accept the invitation and link your account to this workspace.
          </p>
        </div>

        {/* Accept Button */}
        <div className="space-y-3">
          <Button
            onClick={handleDirectAccept}
            disabled={isSubmitting}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-300 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Joining Workspace...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Accept Invitation & Join Team</span>
              </>
            )}
          </Button>

          <p className="text-[11px] text-center text-slate-400 font-medium">
            Authorized workspace member permissions will be granted immediately.
          </p>
        </div>
      </div>
    );
  }

  // State 4B: User is Logged-In with a DIFFERENT Email -> Prompt Switch Account
  if (isAuthenticated && !isEmailMatching) {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 space-y-2 text-left">
          <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            Email Account Mismatch
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            This invitation was sent to <strong className="text-slate-900 font-bold">{invitedEmail}</strong>, but you are currently signed in as <strong className="text-slate-900 font-bold">{userEmail}</strong>.
          </p>
        </div>

        <div className="space-y-2.5">
          <Button
            onClick={handleSwitchAccount}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md gap-2 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Switch Account / Sign In as {invitedEmail}</span>
          </Button>

          <Link href="/dashboard" className="block w-full">
            <Button
              variant="outline"
              className="w-full h-11 font-bold text-xs rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Continue to My Current Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // State 4C: User is NOT Logged In -> IN-PLACE 1-SCREEN ONBOARDING
  return (
    <div className="space-y-5">
      {/* Invitation Overview Header Card */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/80 p-4 space-y-2.5 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
              {companyName ? companyName[0]?.toUpperCase() : "W"}
            </div>
            <div>
              <span className="font-extrabold text-sm text-slate-900 block leading-tight">
                {companyName}
              </span>
              <span className="text-[11px] text-blue-700 font-bold flex items-center gap-1">
                <span>Role:</span>
                <span className="bg-blue-200/80 text-blue-900 px-1.5 py-0.2 rounded font-extrabold text-[10px]">
                  {role}
                </span>
              </span>
            </div>
          </div>
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-bold uppercase">
            Verified Invite
          </Badge>
        </div>

        <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between text-xs text-slate-600">
          <span className="flex items-center gap-1">
            <Mail className="h-3.5 w-3.5 text-blue-600 shrink-0" />
            <span>Invited:</span>
          </span>
          <strong className="text-slate-900 font-bold truncate max-w-[220px]">{invitedEmail}</strong>
        </div>
      </div>

      {/* ── CASE 1: NEW USER (In-Place 1-Click Join Form) ── */}
      {!isExistingUserMode ? (
        <form onSubmit={handleNewUserJoin} className="space-y-3.5 text-left font-sans">
          <div className="text-center pb-1">
            <h3 className="font-extrabold text-base text-slate-900">
              Complete Your Recruiter Profile
            </h3>
          </div>

          {/* Full Name */}
          <div className="space-y-1">
            <Label htmlFor="name" className="text-xs font-bold text-slate-700">
              Your Full Name *
            </Label>
            <div className="relative">
              <User className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                id="name"
                type="text"
                placeholder="e.g. Rohit Panchal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 h-10 rounded-xl border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/30 shadow-2xs"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <Label htmlFor="password" className="text-xs font-bold text-slate-700">
              Create Password *
            </Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-10 rounded-xl border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/30 shadow-2xs"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <Label htmlFor="confirmPassword" className="text-xs font-bold text-slate-700">
              Confirm Password *
            </Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 h-10 rounded-xl border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/30 shadow-2xs"
                required
              />
            </div>
          </div>

          {/* Submit CTA */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 mt-1 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Joining Workspace...</span>
              </>
            ) : (
              <>
                <span>Join {companyName} Team</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          {/* Toggle for existing user */}
          <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
            <span>Already have an account? </span>
            <button
              type="button"
              onClick={() => setIsExistingUserMode(true)}
              className="font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
            >
              Sign In Instead
            </button>
          </div>
        </form>
      ) : (
        /* ── CASE 2: EXISTING USER (Direct Password Sign In) ── */
        <form onSubmit={handleExistingUserJoin} className="space-y-3.5 text-left font-sans">
          <div className="text-center space-y-1">
            <h3 className="font-extrabold text-base text-slate-900">
              Welcome Back! Sign In to Join
            </h3>
            <p className="text-xs text-slate-500">
              Enter your password for <strong className="text-slate-800">{invitedEmail}</strong> to link to this workspace.
            </p>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <Label htmlFor="existingPassword" className="text-xs font-bold text-slate-700">
              Account Password *
            </Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                id="existingPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your account password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-10 rounded-xl border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/30 shadow-2xs"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit CTA */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 mt-1 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Signing In & Joining...</span>
              </>
            ) : (
              <>
                <span>Sign In & Join Team</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          {/* Toggle for new user */}
          <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
            <span>New user? </span>
            <button
              type="button"
              onClick={() => setIsExistingUserMode(false)}
              className="font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
            >
              Create New Recruiter Profile
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] text-slate-900 font-sans px-4 py-12 relative overflow-hidden">
      {/* Ambient Lighting Accents */}
      <div className="absolute top-1/4 -left-20 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Header Branding */}
        <div className="text-center space-y-1.5">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm mb-3">
            <Users className="h-6 w-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Join Workspace Team
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Accept your team invitation to access the recruitment portal
          </p>
        </div>

        {/* Elevated White Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-8 shadow-xl shadow-slate-200/60 space-y-5">
          <Suspense
            fallback={
              <div className="p-8 text-center flex flex-col items-center justify-center space-y-3">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                <p className="text-xs text-slate-500 font-medium">Loading invitation...</p>
              </div>
            }
          >
            <AcceptInvitationContent />
          </Suspense>
        </div>

        {/* Footer Security Badges */}
        <div className="flex items-center justify-center gap-4 text-[11px] font-semibold text-slate-500">
          <span className="flex items-center gap-1">
            <Lock className="h-3 w-3 text-emerald-600" />
            256-Bit Encrypted
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-blue-600" />
            Tenant Isolated
          </span>
        </div>
      </div>
    </div>
  );
}
