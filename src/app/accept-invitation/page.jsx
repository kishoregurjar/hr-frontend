"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Building2,
  Sparkles,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { acceptCompanyInvitation } from "@/lib/api/company";
import { clearAllAuthStorage } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function AcceptInvitationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    // Clear previous sessions for fresh invitation flow
    clearAllAuthStorage();

    const timer = setTimeout(() => {
      if (!token || token.trim().length === 0) {
        setTokenValid(false);
      } else {
        setTokenValid(true);
      }
      setIsVerifying(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [token]);

  const handleAccept = async () => {
    if (!token) {
      toast.error("Invitation token is missing from the link.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await acceptCompanyInvitation(token);
      setSuccessData(res);
      setIsSuccess(true);
      toast.success("Team invitation accepted successfully!");

      // If response includes new auth token, store it
      const payload = res?.data?.data || res?.data || res;
      if (payload?.accessToken || payload?.token) {
        localStorage.setItem("accessToken", payload.accessToken || payload.token);
      }

      // Auto redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login?accepted=true");
      }, 2000);
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to accept invitation. The invitation link may have expired or already been accepted.";

      if (
        errMsg.toLowerCase().includes("expired") ||
        errMsg.toLowerCase().includes("invalid") ||
        errMsg.toLowerCase().includes("not found") ||
        errMsg.toLowerCase().includes("already accepted")
      ) {
        setTokenValid(false);
      }
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // State 1: Verification Loading
  if (isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100 shadow-xs">
          <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Verifying Team Invitation...</h2>
          <p className="text-xs text-slate-500 mt-1">Validating your secure workspace invitation link.</p>
        </div>
      </div>
    );
  }

  // State 2: Invalid or Expired Token
  if (!tokenValid) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-5">
        <div className="h-14 w-14 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-100 shadow-xs">
          <XCircle className="h-7 w-7 text-rose-600" />
        </div>
        <div className="space-y-1.5 max-w-sm">
          <h2 className="text-xl font-extrabold text-slate-900">Invalid or Expired Invitation</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            This recruiter invitation link is no longer valid. It may have expired or already been accepted.
          </p>
        </div>

        <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-800 text-left space-y-1 w-full">
          <div className="font-bold flex items-center gap-1.5 text-amber-900">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            Next Steps
          </div>
          <p className="text-[11px] text-amber-700 leading-relaxed">
            Please ask your company workspace administrator to send you a fresh team invitation email.
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

  // State 3: Successfully Accepted
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-5">
        <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-xs">
          <CheckCircle2 className="h-7 w-7 text-emerald-600" />
        </div>
        <div className="space-y-1.5 max-w-sm">
          <h2 className="text-xl font-extrabold text-slate-900">Invitation Accepted!</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            You are now officially a member of the workspace team. You can sign in to access recruitment analytics and assessments.
          </p>
        </div>

        <div className="pt-2 w-full">
          <Button
            onClick={() => router.push("/login")}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Continue to Sign In</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // State 4: Default - Simple One-Click "Accept Invitation" Screen
  return (
    <div className="space-y-6">
      {/* Workspace & Role Banner Card */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 space-y-2 text-left">
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-600 text-white font-extrabold text-[10px] tracking-wide uppercase px-2 py-0.5">
            Team Invitation
          </Badge>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed font-medium">
          You have been invited to collaborate as a team recruiter. By accepting, you will get access to candidate pipelines, cognitive assessments, and leaderboards.
        </p>
      </div>

      {/* Action Button */}
      <div className="space-y-3">
        <Button
          onClick={handleAccept}
          disabled={isSubmitting}
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-300 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Accepting Invitation...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              <span>Accept Invitation</span>
            </>
          )}
        </Button>

        <p className="text-[11px] text-center text-slate-400 font-medium">
          Click above to verify your invite and join the organization.
        </p>
      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] text-slate-900 font-sans px-4 py-12 relative overflow-hidden">
      {/* Subtle Ambient Glow Elements */}
      <div className="absolute top-1/4 -left-20 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Header Branding */}
        <div className="text-center space-y-1.5">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm mb-3">
            <Users className="h-6 w-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Join Workspace Team
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Accept your team invitation to access the recruitment portal
          </p>
        </div>

        {/* Elevated White Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-8 shadow-xl shadow-slate-200/60 space-y-5">
          <Suspense
            fallback={
              <div className="p-8 text-center flex flex-col items-center justify-center space-y-3">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                <p className="text-xs text-slate-500 font-medium">Verifying invitation...</p>
              </div>
            }
          >
            <AcceptInvitationContent />
          </Suspense>
        </div>

        {/* Footer Security Badges */}
        <div className="flex items-center justify-center gap-4 text-[11px] font-semibold text-slate-500">
          <span className="flex items-center gap-1">
            <Lock className="h-3 w-3 text-emerald-600" />
            256-Bit Encrypted
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-blue-600" />
            Tenant Isolated
          </span>
        </div>
      </div>
    </div>
  );
}
