"use client";

import { Sparkles, CheckCircle2, Lock } from "lucide-react";
import { RegisterForm } from "../components";

const RegisterPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] text-slate-900 font-sans px-4 py-12 relative overflow-hidden">
      {/* Subtle Ambient Glow Elements */}
      <div className="absolute top-1/4 -left-20 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Create HR Recruiter Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Get started with multi-module cognitive assessment pipelines
          </p>
        </div>

        {/* Elevated Executive Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-8 shadow-xl shadow-slate-200/60 space-y-5">
          <RegisterForm />
        </div>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-4 text-[11px] font-semibold text-slate-500">
          <span className="flex items-center gap-1">
            <Lock className="h-3 w-3 text-emerald-600" />
            256-Bit Encrypted
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-blue-600" />
            Zero Setup Required
          </span>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
