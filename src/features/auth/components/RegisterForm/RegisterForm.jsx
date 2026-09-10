"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  Lock,
  Mail,
  User,
  Loader2,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "../../context";

const RegisterForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";
  const initialCompany = searchParams.get("company") || "";
  const returnUrl = searchParams.get("returnUrl") || "";
  const { register } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [company, setCompany] = useState(initialCompany);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
    if (initialCompany) setCompany(initialCompany);
  }, [initialEmail, initialCompany]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter your password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await register({
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        email,
        company: company || undefined,
        password,
      });

      toast.success("Recruiter profile created successfully!", {
        description: `Welcome to HireQuest, ${firstName}!`,
      });

      // If user is already authenticated from registration tokens and returnUrl exists:
      if (returnUrl) {
        // If token was saved, go straight to returnUrl to accept invitation
        const storedToken =
          typeof window !== "undefined" ? localStorage.getItem("token") || localStorage.getItem("accessToken") : null;
        if (storedToken) {
          router.push(returnUrl);
          return;
        }

        router.push(
          `/login?registered=true&email=${encodeURIComponent(email)}&returnUrl=${encodeURIComponent(returnUrl)}`
        );
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create recruiter account. Please check your credentials.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-sans text-left">
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 font-semibold flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Target Workspace Banner (if available) */}
      {company && (
        <div className="rounded-xl border border-blue-100 bg-blue-50/80 p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-600" />
            <div>
              <span className="text-slate-500 text-[11px] block">Invited Workspace</span>
              <strong className="text-slate-900 font-bold">{company}</strong>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold uppercase">
            Recruiter
          </span>
        </div>
      )}

      {/* First & Last Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="firstName" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            First Name *
          </Label>
          <div className="relative">
            <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="firstName"
              type="text"
              placeholder="e.g. Rohit"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/30 transition shadow-2xs"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lastName" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Last Name *
          </Label>
          <Input
            id="lastName"
            type="text"
            placeholder="e.g. Panchal"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="h-11 rounded-xl border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/30 transition shadow-2xs"
            required
          />
        </div>
      </div>

      {/* Work Email */}
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Invited Work Email *
        </Label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <Input
            id="email"
            type="email"
            placeholder="recruiter@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            readOnly={Boolean(initialEmail)}
            className={`pl-10 h-11 rounded-xl border-slate-200 text-xs font-semibold text-slate-900 shadow-2xs ${
              initialEmail
                ? "bg-slate-100/90 text-slate-700 cursor-not-allowed"
                : "bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/30"
            }`}
            required
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Create Password *
        </Label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Min. 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10 h-11 rounded-xl border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/30 transition shadow-2xs"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 focus:outline-none transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Confirm Password *
        </Label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/30 transition shadow-2xs"
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition mt-2 cursor-pointer"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Recruiter Profile...
          </>
        ) : (
          <span className="flex items-center justify-center gap-1.5">
            Complete Profile & Join Workspace
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        )}
      </Button>

      {/* Link to login */}
      <div className="pt-3 border-t border-slate-100 space-y-2 text-center text-xs">
        <p className="text-slate-500 font-medium">Already have an active account?</p>
        <Link
          href={
            returnUrl
              ? `/login?email=${encodeURIComponent(email)}&returnUrl=${encodeURIComponent(returnUrl)}`
              : `/login?email=${encodeURIComponent(email)}`
          }
          className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-700 hover:underline"
        >
          Sign In with existing credentials
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </form>
  );
};

export default RegisterForm;
