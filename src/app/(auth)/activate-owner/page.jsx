"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Building2,
  Sparkles,
} from "lucide-react";
import { activateOwnerApi, normalizeUser } from "@/lib/api/auth";
import { AUTH_STORAGE_KEYS } from "@/features/auth/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ActivateOwnerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!token || token.trim().length === 0) {
        setTokenValid(false);
      } else {
        setTokenValid(true);
      }
      setIsVerifying(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [token]);

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score;
  };

  const strength = getPasswordStrength(password);

  const getStrengthLabel = () => {
    if (!password) return { label: "None", color: "bg-slate-200", text: "text-slate-400", width: "0%" };
    if (strength <= 1) return { label: "Weak", color: "bg-rose-500", text: "text-rose-500", width: "25%" };
    if (strength === 2) return { label: "Fair", color: "bg-amber-500", text: "text-amber-500", width: "50%" };
    if (strength === 3) return { label: "Good", color: "bg-blue-600", text: "text-blue-600", width: "75%" };
    return { label: "Strong", color: "bg-emerald-600", text: "text-emerald-600", width: "100%" };
  };

  const strengthMeta = getStrengthLabel();
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Activation token is missing from the URL.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match. Please verify.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await activateOwnerApi({
        token,
        password,
      });

      const payload = response?.data || response;
      const accessToken =
        payload?.accessToken ||
        payload?.token ||
        payload?.data?.accessToken ||
        payload?.data?.token;

      const refreshToken =
        payload?.refreshToken ||
        payload?.data?.refreshToken;

      const userData = payload?.user || payload?.data?.user;
      const companies = payload?.companies || payload?.data?.companies || [];
      const primaryCompany = (Array.isArray(companies) && companies[0]) || payload?.company;

      if (typeof window !== "undefined" && accessToken) {
        localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, accessToken);
        localStorage.setItem("token", accessToken);
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("jwt", accessToken);
        if (refreshToken) {
          localStorage.setItem("hirequest_refresh_token", refreshToken);
        }

        const normalizedUser = normalizeUser(response) || userData || {};
        if (primaryCompany?.role === "OWNER" || primaryCompany?.role === "COMPANY_OWNER" || !normalizedUser.companyRole) {
          normalizedUser.isOwner = true;
          normalizedUser.companyRole = "OWNER";
          normalizedUser.role = "Company Owner";
          normalizedUser.rawRole = "OWNER";
          if (!normalizedUser.activeCompany) {
            normalizedUser.activeCompany = {
              id: primaryCompany?.id || "",
              name: primaryCompany?.name || "",
              role: "OWNER",
            };
          } else {
            normalizedUser.activeCompany.role = "OWNER";
          }
        }
        localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(normalizedUser));
        localStorage.setItem("active_company_role", "OWNER");
        localStorage.setItem("companyRole", "OWNER");

        if (normalizedUser.email) localStorage.setItem("user_email", normalizedUser.email);

        if (primaryCompany?.id) {
          localStorage.setItem("companyId", primaryCompany.id);
          localStorage.setItem("active_company_id", primaryCompany.id);
        }
        if (primaryCompany?.name) {
          localStorage.setItem("companyName", primaryCompany.name);
        }
        if (primaryCompany?.logoUrl || primaryCompany?.logo) {
          localStorage.setItem("companyLogo", primaryCompany.logoUrl || primaryCompany.logo);
        }
      }

      setIsSuccess(true);
      toast.success("Account activated successfully! Logging you in...");

      // Direct auto-login redirect to dashboard
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Activation failed. The link may have expired or already been used.";

      if (
        errMsg.toLowerCase().includes("expired") ||
        errMsg.toLowerCase().includes("invalid") ||
        errMsg.toLowerCase().includes("not found")
      ) {
        setTokenValid(false);
      }
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // State 1: Verification Loading Screen
  if (isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
          <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Verifying Activation Link...</h2>
          <p className="text-xs text-slate-500 mt-1">Please wait while we validate your invitation token.</p>
        </div>
      </div>
    );
  }

  // State 3: Expired / Invalid Token Screen
  if (!tokenValid) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-5">
        <div className="h-14 w-14 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-100">
          <XCircle className="h-7 w-7 text-rose-600" />
        </div>
        <div className="space-y-1.5 max-w-sm">
          <h2 className="text-xl font-extrabold text-slate-900">Invalid or Expired Link</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            This owner activation link is no longer valid. It may have expired or already been used.
          </p>
        </div>

        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-800 text-left space-y-1 w-full">
          <div className="font-semibold flex items-center gap-1.5 text-amber-900">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            Next Steps
          </div>
          <p className="text-[11px] text-amber-700 leading-relaxed">
            Please contact your Super Administrator to request a fresh workspace activation email.
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

  // Success State: Redirecting to Dashboard
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-5">
        <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
          <CheckCircle2 className="h-7 w-7 text-emerald-600" />
        </div>
        <div className="space-y-1.5 max-w-sm">
          <h2 className="text-xl font-extrabold text-slate-900">Welcome to HireQuest!</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your Organization Owner account has been activated. Redirecting you directly to your workspace dashboard...
          </p>
        </div>

        <div className="pt-2 w-full">
          <Button
            onClick={() => { window.location.href = "/dashboard"; }}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Proceed to Workspace Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // State 2: Valid Link - Set Password Form
  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New Password */}
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Create Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              required
              minLength={8}
              className="pl-10 pr-10 h-11 rounded-xl border-slate-200 text-xs focus:border-blue-500 focus:ring-blue-500/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Password Strength Meter */}
          {password && (
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-[10.5px]">
                <span className="text-slate-500 font-medium">Password Strength:</span>
                <span className={`font-bold ${strengthMeta.text}`}>{strengthMeta.label}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${strengthMeta.color}`}
                  style={{ width: strengthMeta.width }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              required
              className="pl-10 pr-10 h-11 rounded-xl border-slate-200 text-xs focus:border-blue-500 focus:ring-blue-500/20"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {confirmPassword && (
            <div className="flex items-center gap-1.5 text-[11px] pt-0.5">
              {passwordsMatch ? (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Passwords match
                </span>
              ) : (
                <span className="text-rose-500 font-semibold flex items-center gap-1">
                  <XCircle className="h-3.5 w-3.5" /> Passwords do not match
                </span>
              )}
            </div>
          )}
        </div>

        {/* Security Criteria */}
        <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3.5 space-y-1.5 text-xs text-slate-600">
          <div className="font-semibold text-slate-800 text-[11px]">Security Criteria:</div>
          <div className="grid grid-cols-2 gap-1 text-[11px]">
            <div className={`flex items-center gap-1.5 ${password.length >= 8 ? "text-emerald-600 font-medium" : "text-slate-500"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${password.length >= 8 ? "bg-emerald-600" : "bg-slate-300"}`} />
              8+ Characters
            </div>
            <div className={`flex items-center gap-1.5 ${/[A-Z]/.test(password) ? "text-emerald-600 font-medium" : "text-slate-500"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${/[A-Z]/.test(password) ? "bg-emerald-600" : "bg-slate-300"}`} />
              Uppercase Letter
            </div>
            <div className={`flex items-center gap-1.5 ${/[0-9]/.test(password) ? "text-emerald-600 font-medium" : "text-slate-500"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${/[0-9]/.test(password) ? "bg-emerald-600" : "bg-slate-300"}`} />
              Number (0-9)
            </div>
            <div className={`flex items-center gap-1.5 ${/[^A-Za-z0-9]/.test(password) ? "text-emerald-600 font-medium" : "text-slate-500"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${/[^A-Za-z0-9]/.test(password) ? "bg-emerald-600" : "bg-slate-300"}`} />
              Special Symbol
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || password.length < 8 || !passwordsMatch}
          className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Activating Account...</span>
            </>
          ) : (
            <>
              <span>Activate Account & Continue</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

export default function ActivateOwnerPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] text-slate-900 font-sans px-4 py-12 relative overflow-hidden">
      {/* Subtle Ambient Glow Elements matching HireQuest Auth */}
      <div className="absolute top-1/4 -left-20 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Activate Your Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Set up your Organization Owner credentials to access your portal
          </p>
        </div>

        {/* Elevated Executive Card matching LoginPage */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-8 shadow-xl shadow-slate-200/60 space-y-5">
          <Suspense
            fallback={
              <div className="p-8 text-center flex flex-col items-center justify-center space-y-3">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                <p className="text-xs text-slate-500">Loading activation...</p>
              </div>
            }
          >
            <ActivateOwnerContent />
          </Suspense>
        </div>

        {/* Trust Badges matching HireQuest Design System */}
        <div className="flex items-center justify-center gap-4 text-[11px] font-semibold text-slate-500">
          <span className="flex items-center gap-1">
            <Lock className="h-3 w-3 text-emerald-600" />
            256-Bit Encrypted
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-blue-600" />
            Enterprise Tenant Security
          </span>
        </div>
      </div>
    </div>
  );
}
