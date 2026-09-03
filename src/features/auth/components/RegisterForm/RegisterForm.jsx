"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Lock, Mail, User, Loader2, Eye, EyeOff, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "../../context";

const RegisterForm = () => {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
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
      router.push("/login?registered=true");
    } catch (err) {
      setError(err.message || "Failed to create account. Please try again.");
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

      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Full Name
        </Label>
        <div className="relative">
          <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <Input
            id="name"
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 transition shadow-2xs"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Work Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <Input
            id="email"
            type="email"
            placeholder="Enter your work email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 transition shadow-2xs"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="company" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Company / Organization
        </Label>
        <div className="relative">
          <Building2 className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <Input
            id="company"
            type="text"
            placeholder="Enter your company name"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 transition shadow-2xs"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password (min. 6 characters)"
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
            Creating Account...
          </>
        ) : (
          <span className="flex items-center justify-center gap-1.5">
            Create HR Recruiter Account
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        )}
      </Button>

      <p className="text-center text-xs text-slate-500 font-medium pt-3 border-t border-slate-100">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline">
          Sign In
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;
