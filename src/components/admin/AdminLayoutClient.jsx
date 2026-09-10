"use client";

import { useState, useEffect, createContext, useContext, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import AdminSidebar from "./AdminSidebar";
import AdminWelcomeOverlay from "./AdminWelcomeOverlay";
import { useAuth } from "@/features/auth/context/AuthContext";

export const AdminNavContext = createContext({
  sidebarOpen: false,
  setSidebarOpen: () => {},
  toggleSidebar: () => {},
});

export const useAdminNav = () => useContext(AdminNavContext);

export default function AdminLayoutClient({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const isSuperAdmin =
    user?.role === "SUPER_ADMIN" ||
    user?.role === "PLATFORM_ADMIN" ||
    user?.role === "ADMIN" ||
    user?.email?.toLowerCase()?.includes("admin") ||
    user?.isSuperAdmin;

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        toast.error("Please sign in as Super Admin to access this console.");
        router.push("/login");
      } else if (!isSuperAdmin) {
        toast.error("Access restricted: Super Administrator credentials required.");
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, isSuperAdmin, isLoading, router]);

  // Loading state while verifying auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] text-slate-900 font-sans space-y-3">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Verifying Super Administrator security tokens...</p>
      </div>
    );
  }

  // If not authenticated or not super admin, block view during redirect
  if (!isAuthenticated || !isSuperAdmin) {
    return null;
  }

  return (
    <AdminNavContext.Provider
      value={{
        sidebarOpen,
        setSidebarOpen,
        toggleSidebar: () => setSidebarOpen((prev) => !prev),
      }}
    >
      <Suspense fallback={null}>
        <AdminWelcomeOverlay />
      </Suspense>

      <div className="flex h-screen w-screen overflow-hidden bg-[#f8fafc] text-slate-900 font-sans antialiased">
        {/* Super Admin Fixed Sidebar */}
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Backdrop overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Dedicated Scrollable Admin Viewport */}
        <div className="flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden min-w-0 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {children}
        </div>
      </div>
    </AdminNavContext.Provider>
  );
}
