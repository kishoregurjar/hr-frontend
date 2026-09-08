"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Building2, CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { acceptCompanyInvitation } from "@/lib/api/company";
import { toast } from "sonner";
import Link from "next/link";

function AcceptInvitationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

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
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to accept company invitation. Token may be invalid or expired.");
    } finally {
      setLoading(false);
    }
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

        {error && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center gap-2 text-left">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
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
          <div className="space-y-4">
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
            <p className="text-[11px] text-muted-foreground">
              Make sure you are logged in with the invited email address.
            </p>
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
