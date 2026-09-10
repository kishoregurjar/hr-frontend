"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  Mail,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "../../context";
import ForgotPasswordDialog from "../ForgotPasswordDialog";

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegisteredSuccess = searchParams.get("registered") === "true";
  const isActivatedSuccess = searchParams.get("activated") === "true";
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorType, setErrorType] = useState(null); // 'INVALID_CREDENTIALS' | 'ACCOUNT_SUSPENDED' | 'COMPANY_SUSPENDED' | 'PENDING_ACTIVATION' | 'GENERAL'
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorType(null);
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const authRes = await login({ email: email.trim(), password });
      if (typeof window !== "undefined") {
        localStorage.setItem("user_email", email.trim());
      }
      const loggedUser = authRes?.user || authRes;
      const userName =
        loggedUser?.name ||
        loggedUser?.firstName ||
        "User";

      toast.success(`Welcome back, ${userName}!`, {
        description: "Signing into your dashboard...",
      });

      // Role-Based Post-Login Routing
      const role = (loggedUser?.role || "").toUpperCase();
      const isSuperAdmin =
        role === "SUPER_ADMIN" ||
        role === "PLATFORM_ADMIN" ||
        email.toLowerCase().includes("admin") ||
        loggedUser?.isSuperAdmin;

      if (isSuperAdmin) {
        router.push("/admin?welcome=true");
      } else if (role === "CANDIDATE") {
        router.push("/take-test");
      } else {
        // OWNER, HR, RECRUITER, ADMIN (Company level)
        router.push("/dashboard");
      }
    } catch (err) {
      const status = err?.response?.status;
      const code = err?.response?.data?.code || "";
      const rawMsg = err?.response?.data?.message || err?.message || "";

      if (status === 401 || rawMsg.toLowerCase().includes("invalid credentials") || rawMsg.toLowerCase().includes("password")) {
        setErrorType("INVALID_CREDENTIALS");
        setErrorMessage("Invalid email address or password. Please try again.");
      } else if (rawMsg.toLowerCase().includes("account suspended") || code === "ACCOUNT_SUSPENDED") {
        setErrorType("ACCOUNT_SUSPENDED");
        setErrorMessage("Your user account has been suspended. Please contact your administrator.");
      } else if (rawMsg.toLowerCase().includes("company suspended") || code === "COMPANY_SUSPENDED") {
        setErrorType("COMPANY_SUSPENDED");
        setErrorMessage("Your company account is currently suspended. Please contact Super Admin support.");
      } else if (rawMsg.toLowerCase().includes("activation") || rawMsg.toLowerCase().includes("invited") || code === "PENDING_ACTIVATION") {
        setErrorType("PENDING_ACTIVATION");
        setErrorMessage("Your account is pending activation. Please check your email for the activation link.");
      } else {
        setErrorType("GENERAL");
        setErrorMessage(rawMsg || "Authentication failed. Please verify your credentials.");
      }

      toast.error(errorMessage || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-sans">
      {/* Registration Success Banner */}
      {isRegisteredSuccess && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-3.5 text-xs text-emerald-800 font-semibold flex items-center gap-2.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Account created successfully! Please sign in with your credentials.</span>
        </div>
      )}

      {/* Activation Success Banner */}
      {isActivatedSuccess && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-3.5 text-xs text-emerald-800 font-semibold flex items-center gap-2.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Account activated successfully! Please sign in with your email and new password.</span>
        </div>
      )}

      {/* Error Banners with Tailored Styling according to Blueprint */}
      {errorType === "INVALID_CREDENTIALS" && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs text-rose-700 font-medium flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {errorType === "ACCOUNT_SUSPENDED" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-3.5 text-xs text-amber-800 font-medium flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {errorType === "COMPANY_SUSPENDED" && (
        <div className="rounded-2xl border border-rose-300 bg-rose-50 p-3.5 text-xs text-rose-800 font-medium flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {errorType === "PENDING_ACTIVATION" && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/90 p-3.5 text-xs text-blue-800 font-medium flex items-start gap-2.5">
          <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {errorType === "GENERAL" && errorMessage && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 font-medium flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Email Field */}
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Email Address
        </Label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            id="email"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
            required
            autoComplete="email"
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10 h-11 rounded-xl border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 focus:outline-none transition-colors cursor-pointer"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Options Row: Remember Me & Forgot Password */}
      <div className="flex items-center justify-between text-xs pt-1">
        <label className="flex items-center gap-2 text-slate-600 font-medium cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
          />
          <span>Remember me</span>
        </label>

        <ForgotPasswordDialog initialEmail={email} />
      </div>

      {/* Primary Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting || !email.trim() || !password}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-300 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all mt-2 cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          <span className="flex items-center justify-center gap-1.5">
            <span>Sign In</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        )}
      </Button>
    </form>
  );
};

export default LoginForm;
