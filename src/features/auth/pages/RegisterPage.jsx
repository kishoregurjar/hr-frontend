"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ShieldCheck, Mail, ArrowRight, Building2, Lock, CheckCircle2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import RegisterForm from "../components/RegisterForm/RegisterForm";

function RegisterContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const returnUrl = searchParams.get("returnUrl") || "";
  const companyParam = searchParams.get("company") || "";

  const isInviteFlow = Boolean(emailParam || returnUrl || companyParam);
  const [showForm, setShowForm] = useState(isInviteFlow);

  useEffect(() => {
    if (isInviteFlow) {
      setShowForm(true);
    }
  }, [isInviteFlow]);

  return (
    <div className="w-full max-w-md space-y-6 relative z-10">
      {/* Brand Header */}
      <div className="text-center space-y-1.5">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-2">
          <div className="h-10 w-10 rounded-2xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shadow-md">
            H
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900">
            HireQuest
          </span>
        </Link>
        <div className="inline-block px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold uppercase tracking-wider">
          {showForm ? "Recruiter Account Registration" : "Enterprise Onboarding Notice"}
        </div>
      </div>

      {/* Elevated Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-8 shadow-xl shadow-slate-200/60 space-y-5">
        {showForm ? (
          <div>
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
        ) : (
          <div className="text-center space-y-5">
            <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
              <ShieldCheck className="h-7 w-7 text-blue-600" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-extrabold text-slate-900">
                Invitation-Only Workspace Access
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                Client organization workspaces are created exclusively through HireQuest invitation links.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left space-y-2">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-blue-600" />
                Invited by your company?
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                If you received a team invitation, check your work email for your direct link or register your invited account below.
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <Button
                onClick={() => setShowForm(true)}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus className="h-4 w-4" />
                <span>Create Recruiter Account</span>
              </Button>

              <Link href="/login" className="block w-full">
                <Button
                  variant="outline"
                  className="w-full h-11 font-bold text-xs rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  <span>Go to Universal Sign In</span>
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        )}
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
          Multi-Tenant Isolation
        </span>
      </div>
    </div>
  );
}

const RegisterPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] text-slate-900 font-sans px-4 py-12 relative overflow-hidden">
      {/* Subtle Ambient Glow Elements */}
      <div className="absolute top-1/4 -left-20 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-semibold">Loading registration...</div>}>
        <RegisterContent />
      </Suspense>
    </div>
  );
};

export default RegisterPage;
