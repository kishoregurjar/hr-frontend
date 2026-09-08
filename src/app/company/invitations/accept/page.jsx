"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Building2, CheckCircle2, AlertCircle, Loader2, ArrowRight, LogOut, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { acceptCompanyInvitation } from "@/lib/api/company";
import { useAuth } from "@/features/auth/context";
import { toast } from "sonner";
import Link from "next/link";

function AcceptInvitationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const { user, isAuthenticated, logout } = useAuth();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const currentUserEmail = user?.email || "";

  const handleAccept = async () => {
    if (!token) {
      setError("Invitation token is missing from the URL.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await acceptCompanyInvitation(token);
      setSuccess(true);
      toast.success("You have successfully joined the company workspace!");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to accept company invitation. Token may be invalid or expired.");
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchAccount = async () => {
    await logout();
    router.push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-card w-full max-w-md rounded-2xl border shadow-xl p-8 text-center space-y-6">
        <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <Building2 className="h-8 w-8" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">Company Team Invitation</h1>
          <p className="text-sm text-muted-foreground mt-1">
            You have been invited to collaborate as a recruiter on Minders World.
          </p>
        </div>

        {/* ── Logged-in user badge ── */}
        {isAuthenticated && currentUserEmail && (
          <div className="p-3 rounded-xl bg-slate-100 border text-xs text-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <UserCheck className="h-4 w-4 text-blue-600 shrink-0" />
              <span className="truncate">Logged in as: <strong>{currentUserEmail}</strong></span>
            </div>
            <button
              onClick={handleSwitchAccount}
              className="text-xs font-bold text-indigo-600 hover:underline shrink-0 ml-2"
            >
              Switch Account
            </button>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium space-y-2 text-left">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
            {error.toLowerCase().includes("does not match") && (
              <p className="text-xs text-slate-600">
                Aapka current account (<strong>{currentUserEmail}</strong>) is invitation ke email se match nahi karta. Please us email se login karein jis par invitation bheja gaya tha.
              </p>
            )}
          </div>
        )}

        {success ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center justify-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span>Invitation accepted! Redirecting to Dashboard...</span>
            </div>
            <Link href="/dashboard">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 font-bold">
                Go to Dashboard Now <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <Button
              onClick={handleAccept}
              disabled={loading || !token}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-bold text-sm shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Accepting Invitation...
                </>
              ) : (
                "Accept Invitation & Join Team"
              )}
            </Button>

            {error?.toLowerCase().includes("does not match") && (
              <Button
                type="button"
                variant="outline"
                onClick={handleSwitchAccount}
                className="w-full font-bold text-xs h-10 border-slate-300 gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5 text-rose-600" />
                Sign Out & Log In with Invited Email
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Loading invitation...</div>}>
      <AcceptInvitationContent />
    </Suspense>
  );
}
