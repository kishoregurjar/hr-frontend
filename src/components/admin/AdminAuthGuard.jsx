"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/context";

export default function AdminAuthGuard({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const isSuperAdmin =
    user?.role === "SUPER_ADMIN" ||
    user?.role === "PLATFORM_ADMIN" ||
    user?.role === "ADMIN" ||
    user?.email?.toLowerCase()?.includes("admin") ||
    user?.isSuperAdmin;

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
    } else if (!isSuperAdmin) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isSuperAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
        <p className="text-xs text-slate-500 font-medium tracking-wide">
          Loading Admin Console...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !isSuperAdmin) {
    return null;
  }

  return <>{children}</>;
}
