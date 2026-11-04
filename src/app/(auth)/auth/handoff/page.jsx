"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { consumeExchangeTicketApi, setAuthSession } from "@/lib/api/auth";
import { ShieldCheck, AlertCircle } from "lucide-react";

function HandoffContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const ticket = searchParams.get("ticket");
    const redirect = searchParams.get("redirect") || "/dashboard";

    if (!ticket) {
      router.replace("/login");
      return;
    }

    let isMounted = true;

    consumeExchangeTicketApi(ticket)
      .then((payload) => {
        if (!isMounted) return;
        const accessToken = payload?.accessToken || payload?.data?.accessToken;
        const refreshToken = payload?.refreshToken || payload?.data?.refreshToken;
        const user = payload?.user || payload?.data?.user;

        if (accessToken && user) {
          setAuthSession(accessToken, user, refreshToken);
          // Clean redirect without retaining ticket in browser history
          window.location.replace(redirect.startsWith("/") ? redirect : "/dashboard");
        } else {
          throw new Error("Invalid session payload received.");
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Single-use authentication ticket expired or invalid.";
        setError(msg);
        setTimeout(() => {
          router.replace("/login?session_expired=true");
        }, 2000);
      });

    return () => {
      isMounted = false;
    };
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Authentication Failed</h2>
          <p className="text-sm text-slate-500">{error}</p>
          <p className="text-xs text-slate-400">Redirecting to sign-in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto animate-pulse">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Authenticating Workspace Access</h2>
        <p className="text-sm text-slate-500">Securely loading your workspace session...</p>
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mt-4" />
      </div>
    </div>
  );
}

export default function HandoffPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-sm text-slate-500">Loading...</div>
        </div>
      }
    >
      <HandoffContent />
    </Suspense>
  );
}

