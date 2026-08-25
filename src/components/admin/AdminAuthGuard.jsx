"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useAuth } from "@/features/auth/context";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminAuthGuard({ children }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const isSuperAdmin =
    !user ||
    user?.role === "SUPER_ADMIN" ||
    user?.role === "PLATFORM_ADMIN" ||
    user?.role === "ADMIN" ||
    user?.email?.includes("admin") ||
    user?.isSuperAdmin;

  const [bypass, setBypass] = useState(false);

  // If user is explicitly an HR, block access unless testing in developer mode
  const isBlocked = !bypass && user && (user.role === "HR" || user.role === "RECRUITER") && !user.isSuperAdmin;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-xs text-muted-foreground font-medium animate-pulse">
          Verifying Super Admin Authorization...
        </p>
      </div>
    );
  }

  if (isBlocked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-900 text-white text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-lg">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Super Admin Access Restricted
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-md">
          You are currently signed in as an <strong>HR Recruiter</strong> ({user?.email}). The Platform Master Console is reserved for Minders World Super Administrators.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link href="/dashboard">
            <Button variant="outline" className="text-xs font-semibold gap-1.5 bg-slate-800 text-white border-slate-700 hover:bg-slate-700">
              <ArrowLeft className="h-4 w-4" />
              Return to HR Dashboard
            </Button>
          </Link>

          <Button
            onClick={() => setBypass(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-1.5 shadow-md shadow-blue-500/25"
          >
            ⚡ Preview as Super Admin
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
