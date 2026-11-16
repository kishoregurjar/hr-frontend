"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ShieldCheck, Lock, CheckCircle2, CreditCard, Sparkles, ArrowRight, LayoutGrid } from "lucide-react";
import RegisterForm from "../components/RegisterForm/RegisterForm";
import CompanyOnboardingForm from "../components/CompanyOnboardingForm/CompanyOnboardingForm";

function RegisterContent() {
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan");
  const emailParam = searchParams.get("email") || "";
  const returnUrl = searchParams.get("returnUrl") || "";
  const companyParam = searchParams.get("company") || "";

  const isMemberInvite = Boolean(emailParam || returnUrl || companyParam);
  const isCompanyOnboarding = Boolean(planParam) || !isMemberInvite;

  return (
    <div className={`w-full ${isCompanyOnboarding ? "max-w-6xl" : "max-w-md"} mx-auto space-y-4 relative z-10 transition-all`}>
      {/* ── Top Navigation Bar ── */}
      <header className="flex items-center justify-between py-1.5 border-b border-slate-200/60 pb-3">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-700 text-white font-black text-lg flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:scale-105 transition transform">
            H
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition">
                HireQuest
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-black uppercase tracking-wider">
                {isCompanyOnboarding ? "Workspace Onboarding" : "Member Invite"}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
              AI-Powered Cognitive & Skill Screening Platform
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2 text-xs">
          {isCompanyOnboarding && (
            <Link
              href="/plans"
              className="hidden sm:inline-flex items-center gap-1 font-bold text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition text-[11px]"
            >
              <LayoutGrid className="h-3 w-3" />
              <span>Compare Plans</span>
            </Link>
          )}
          <Link
            href="/login"
            className="inline-flex items-center gap-1 font-bold text-blue-600 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/80 px-3 py-1 rounded-lg transition text-[11px]"
          >
            <span>Sign In</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </header>

      {/* ── Main Content Area ── */}
      {isCompanyOnboarding ? (
        <CompanyOnboardingForm />
      ) : (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-8 shadow-xl shadow-slate-200/60 space-y-5">
          <div className="text-center space-y-1.5 mb-5">
            <h1 className="text-xl font-extrabold text-slate-900">
              Complete Your Recruiter Profile
            </h1>
            <p className="text-xs text-slate-500">
              Set up your login credentials to access the candidate screening workspace.
            </p>
          </div>
          <RegisterForm />
        </div>
      )}

      {/* ── Footer Trust Badges ── */}
      <footer className="pt-2.5 border-t border-slate-200/60 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[10px] font-bold text-slate-400">
        <span className="flex items-center gap-1">
          <Lock className="h-3 w-3 text-emerald-600" />
          256-Bit SSL Encryption
        </span>
        <span className="hidden sm:inline text-slate-300">•</span>
        <span className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3 text-blue-600" />
          Isolated Multi-Tenant Subdomains
        </span>
        <span className="hidden sm:inline text-slate-300">•</span>
        <span className="flex items-center gap-1">
          <CreditCard className="h-3 w-3 text-indigo-600" />
          Razorpay Verified Gateway
        </span>
      </footer>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans px-4 py-4 sm:py-6 relative overflow-x-hidden">
      <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500 font-semibold">Loading registration...</div>}>
        <RegisterContent />
      </Suspense>
    </div>
  );
}
