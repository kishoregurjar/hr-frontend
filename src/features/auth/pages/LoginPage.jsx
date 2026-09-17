"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Zap,
  Target,
  BarChart3,
  Building2,
  Sparkles,
} from "lucide-react";

import { LoginForm } from "../components";
import { useAuth } from "../context";
import { clearAllAuthStorage } from "@/lib/api/auth";

const LoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isActivated = searchParams.get("activated") === "true";
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    if (isActivated) {
      clearAllAuthStorage();
      try {
        logout();
      } catch {}
      return;
    }

    if (!isLoading && isAuthenticated && user) {
      const role = (user?.role || "").toUpperCase();
      const isSuperAdmin =
        role === "SUPER_ADMIN" ||
        role === "PLATFORM_ADMIN" ||
        user?.email?.toLowerCase().includes("admin") ||
        user?.isSuperAdmin;

      if (isSuperAdmin) {
        router.push("/admin");
      } else if (role === "CANDIDATE") {
        router.push("/take-test");
      } else {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, isLoading, user, router, isActivated, logout]);

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 font-sans bg-[#f8fafc]">
      {/* ── Left Side: Enterprise Branding & Graphics (Split-Screen 50%) ── */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 text-white p-12 lg:p-16 relative overflow-hidden shadow-2xl">
        {/* Subtle Ambient Background Glows */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-400/25 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-indigo-500/25 blur-3xl pointer-events-none" />

        {/* Top: Logo & Platform Badge */}
        <div className="relative z-10 flex flex-col items-start gap-3">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-2xl bg-white text-blue-600 font-black text-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              H
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              HireQuest
            </span>
          </Link>
          <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold text-blue-100 border border-white/20 shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 animate-pulse" />
            Enterprise Recruitment & Assessment Platform
          </div>
        </div>

        {/* Middle: Value Proposition & Feature Highlights */}
        <div className="relative z-10 space-y-8 my-auto py-8">
          <div className="space-y-3">
            <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight tracking-tight drop-shadow-xs">
              Screen top talent faster with automated assessments.
            </h2>
            <p className="text-sm text-blue-100/90 max-w-lg leading-relaxed font-medium">
              HireQuest empowers Super Admins, Client Owners, and HR Recruiters with multi-tenant candidate evaluation, AI screening, and real-time skill analytics.
            </p>
          </div>

          <div className="space-y-3.5 max-w-lg">
            {/* Feature 1 */}
            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-xs hover:bg-white/15 transition-all">
              <div className="h-9 w-9 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0 border border-white/30">
                <Zap className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-white">1-Click Candidate Inbound Sync</h3>
                <p className="text-[11px] text-blue-100/80 leading-relaxed">
                  Connect mailboxes, extract resumes, and automatically dispatch tests.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-xs hover:bg-white/15 transition-all">
              <div className="h-9 w-9 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0 border border-white/30">
                <Target className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-white">Interactive Assessment Engine</h3>
                <p className="text-[11px] text-blue-100/80 leading-relaxed">
                  Cognitive challenges, coding tasks, and role-specific questionnaires.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-xs hover:bg-white/15 transition-all">
              <div className="h-9 w-9 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0 border border-white/30">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-white">Unified Multi-Tenant Analytics</h3>
                <p className="text-[11px] text-blue-100/80 leading-relaxed">
                  Real-time leaderboard scores, completion telemetry, and PDF reports.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Trust & Security Footnote */}
        <div className="relative z-10 flex items-center gap-6 text-xs text-blue-100/80 pt-6 border-t border-white/15 font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            Tenant Isolated Database
          </span>
          <span>•</span>
          <span>Role-Based Access Control</span>
          <span>•</span>
          <span>99.9% Platform Uptime</span>
        </div>
      </div>

      {/* ── Right Side: Clean Universal Login Form Card ── */}
      <div className="flex flex-col justify-center items-center px-4 sm:px-8 lg:px-12 py-12 relative">
        {/* Mobile-only Logo Header */}
        <div className="lg:hidden text-center mb-6 space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shadow-md">
              H
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">
              HireQuest
            </span>
          </Link>
        </div>

        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="space-y-1.5 text-left">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Sign in to access your dashboard
            </p>
          </div>

          {/* Elevated Form Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-8 shadow-xl shadow-slate-200/60">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
