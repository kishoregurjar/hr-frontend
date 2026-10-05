"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/context";

export default function AdminAuthGuard({ children }) {
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const rawRoleStr = String(
    user?.rawRole || user?.role || ""
  )
    .toUpperCase()
    .trim()
    .replace(/\s+/g, "_");

  const isSuperAdmin =
    rawRoleStr === "SUPER_ADMIN" ||
    rawRoleStr === "PLATFORM_ADMIN" ||
    user?.isSuperAdmin === true;

  useEffect(() => {
    if (!mounted || isLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
    } else if (!isSuperAdmin) {
      router.replace("/dashboard");
    }
  }, [mounted, isAuthenticated, isSuperAdmin, isLoading, router]);

  if (!mounted || isLoading) {
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
