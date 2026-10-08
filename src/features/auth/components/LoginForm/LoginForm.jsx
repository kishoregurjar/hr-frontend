"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User,
  Lock,
  Mail,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
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
  const isExpiredSession = searchParams.get("expired") === "true";
  const isSuspendedSession = searchParams.get("suspended") === "true";
  const initialEmail = searchParams.get("email") || "";
  const { login } = useAuth();

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorType, setErrorType] = useState(null); // 'INVALID_CREDENTIALS' | 'ACCOUNT_SUSPENDED' | 'COMPANY_SUSPENDED' | 'PENDING_ACTIVATION' | 'GENERAL'
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorType(null);
    setErrorMessage("");

    const targetEmail = (email || e.target.email?.value || "").trim();
    const targetPassword = password || e.target.password?.value || "";

    if (!targetEmail || !targetPassword) {
      setErrorType("INVALID_CREDENTIALS");
      setErrorMessage("Please enter both your email address and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const authRes = await login({ email: targetEmail, password: targetPassword });
      if (typeof window !== "undefined") {
        localStorage.setItem("user_email", targetEmail);
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

      const returnUrl = searchParams.get("returnUrl");

      if (returnUrl && !isSuperAdmin) {
        router.push(returnUrl);
      } else if (isSuperAdmin) {
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
      {/* Session Expired Banner */}
      {isExpiredSession && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-3.5 text-xs text-amber-800 font-semibold flex items-center gap-2.5">
          <Info className="h-4 w-4 text-amber-600 shrink-0" />
          <span>Session expired. Please sign in again to continue.</span>
        </div>
      )}

      {/* Company Suspended Banner */}
      {isSuspendedSession && (
        <div className="rounded-2xl border border-rose-300 bg-rose-50 p-3.5 text-xs text-rose-800 font-semibold flex items-center gap-2.5">
          <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>Your company account has been suspended. Please contact the administrator.</span>
        </div>
      )}

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
      <div className="space-y-1">
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            id="email"
            type="email"
            placeholder="vishnu@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 h-11 sm:h-12 rounded-xl border-slate-200 bg-white text-xs sm:text-sm font-normal text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
            required
            autoComplete="email"
            aria-label="Email Address"
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="space-y-1">
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10 h-11 sm:h-12 rounded-xl border-slate-200 bg-white text-xs sm:text-sm font-normal text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
            required
            autoComplete="current-password"
            aria-label="Password"
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
            className="h-4 w-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer accent-blue-600"
          />
          <span>Remember me</span>
        </label>

        <ForgotPasswordDialog initialEmail={email} />
      </div>

      {/* Primary Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-11 sm:h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/25 transition-all mt-2 cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </Button>

      {/* Footer text */}
      <p className="text-center text-xs text-slate-500 pt-4">
        Don&apos;t have an account?{" "}
        <Link
          href="mailto:support@hirequest.com"
          className="font-bold text-slate-900 hover:underline"
        >
          Contact Admin
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
