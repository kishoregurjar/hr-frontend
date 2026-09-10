"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Lock, Mail, User, Loader2, Eye, EyeOff, ArrowRight, Globe } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "../../context";

const RegisterForm = () => {
  const router = useRouter();
  const { register } = useAuth();

  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await register({ name, email, company, password });
      toast.success("Company Workspace created successfully!", {
        description: `Welcome to HireQuest, ${name}! Please sign in to access your company dashboard.`,
      });
      router.push("/login?registered=true");
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to register company. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-sans">
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 font-semibold">
          {error}
        </div>
      )}

      {/* Company Name */}
      <div className="space-y-1.5">
        <Label htmlFor="company" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Company Name *
        </Label>
        <div className="relative">
          <Building2 className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <Input
            id="company"
            type="text"
            placeholder="Enter company workspace name"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 transition shadow-2xs"
            required
          />
        </div>
      </div>

      {/* Company Owner / HR Lead Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Company Owner / Primary Admin Name *
        </Label>
        <div className="relative">
          <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <Input
            id="name"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 transition shadow-2xs"
            required
          />
        </div>
      </div>

      {/* Work Email */}
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Official Work Email *
        </Label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <Input
            id="email"
            type="email"
            placeholder="work.email@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 transition shadow-2xs"
            required
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Workspace Password *
        </Label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter password (min. 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10 h-11 rounded-xl border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 transition shadow-2xs"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 focus:outline-none transition-colors"
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

      <Button
        type="submit"
        className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/25 transition mt-2 cursor-pointer"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Workspace...
          </>
        ) : (
          <span className="flex items-center justify-center gap-1.5">
            Register Company Workspace
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        )}
      </Button>

      {/* Helper for Invited HRs */}
      <div className="pt-3 border-t border-slate-100 space-y-2 text-center text-xs">
        <p className="text-slate-600 font-medium">
          Invited by your company as an HR Recruiter?
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
        >
          Sign In to your workspace
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </form>
  );
};

export default RegisterForm;
