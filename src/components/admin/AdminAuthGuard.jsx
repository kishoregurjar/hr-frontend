"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/context";

export default function AdminAuthGuard({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const isSuperAdmin =
    user?.role === "SUPER_ADMIN" ||
    user?.role === "PLATFORM_ADMIN" ||
    user?.role === "ADMIN" ||
    user?.email?.toLowerCase().includes("admin") ||
    user?.isSuperAdmin;

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      toast.error("Please sign in to access the Admin Console.");
      router.replace("/login");
      return;
    }

    if (!isSuperAdmin) {
      toast.error("Access restricted: Super Admin privileges required.");
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isSuperAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <p className="text-xs text-slate-500 font-semibold animate-pulse">
          Verifying Super Admin Authorization...
        </p>
      </div>
    );
  }

  // If not super admin, show brief clean fallback while redirecting to dashboard
  if (!isAuthenticated || !isSuperAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <p className="text-xs text-slate-500 font-semibold animate-pulse">
          Redirecting to HR Dashboard...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
