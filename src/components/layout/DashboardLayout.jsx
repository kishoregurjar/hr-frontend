"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  ArrowLeft,
  ShieldAlert,
  AlertTriangle,
  Lock,
  ArrowRight,
  Clock,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/context";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";

const DashboardLayout = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [impersonatedCompany, setImpersonatedCompany] = useState(null);
  const [isPlanExpired, setIsPlanExpired] = useState(false);

  const isOwner = Boolean(
    user?.isOwner ||
    user?.activeCompany?.role === "OWNER" ||
    user?.companyRole === "OWNER" ||
    String(user?.role || "").toUpperCase() === "OWNER"
  );

  const isPlansPage = pathname === "/company/plans" || pathname.startsWith("/company/plans/");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("hq_impersonated_company");
      if (stored) {
        setImpersonatedCompany(JSON.parse(stored));
      }
    } catch {}
  }, []);

  // Listen for global plan expired and plan renewed events
  useEffect(() => {
    const handlePlanExpired = () => {
      setIsPlanExpired(true);
    };

    const handlePlanRenewed = () => {
      setIsPlanExpired(false);
    };

    // Check initial user/company status
    const initialStatus =
      user?.activeCompany?.planStatus ||
      user?.planStatus ||
      user?.companies?.[0]?.planStatus;

    if (
      initialStatus === "EXPIRED" ||
      initialStatus === "DEMO_EXPIRED" ||
      initialStatus === "CANCELLED"
    ) {
      setIsPlanExpired(true);
    }

    window.addEventListener("hirequest:plan-expired", handlePlanExpired);
    window.addEventListener("hirequest:plan-renewed", handlePlanRenewed);

    return () => {
      window.removeEventListener("hirequest:plan-expired", handlePlanExpired);
      window.removeEventListener("hirequest:plan-renewed", handlePlanRenewed);
    };
  }, [user]);

  const handleExitImpersonation = () => {
    try {
      localStorage.removeItem("hq_impersonated_company");
      toast.info("Exited company workspace. Returning to Super Admin console.");
      router.push("/admin/companies");
    } catch {
      router.push("/admin/companies");
    }
  };

  return (
    <div className="flex flex-col h-screen w-full max-w-full overflow-hidden bg-[#f8fafc] text-slate-900 font-sans antialiased">
      {/* ── Top Support / Impersonation Banner ── */}
      {impersonatedCompany && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white px-4 py-2 text-xs font-semibold flex flex-wrap items-center justify-between gap-3 shadow-md z-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 rounded-full bg-white animate-ping" />
            <span className="bg-white/20 border border-white/30 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-extrabold flex items-center gap-1">
              <ShieldAlert className="h-3 w-3" />
              Support Mode
            </span>
            <span className="text-amber-50 font-medium">
              You are inspecting <strong className="text-white font-black underline decoration-white/60">{impersonatedCompany.name}</strong> ({impersonatedCompany.domain || impersonatedCompany.email}) as Super Admin
            </span>
          </div>

          <button
            type="button"
            onClick={handleExitImpersonation}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white hover:bg-slate-50 text-amber-900 font-extrabold text-xs shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Exit to Admin Console</span>
          </button>
        </div>
      )}

      {/* ── Top Persistent Plan Expired Alert Bar (Visible when on Plans page) ── */}
      {isPlanExpired && isPlansPage && (
        <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between gap-3 shadow-md z-40 shrink-0 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-black">
              Action Required
            </span>
            <span className="text-rose-100">
              Your subscription has expired. Workspace access is locked. Please select a plan below and complete payment to restore full access.
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-1 h-full min-w-0 overflow-hidden">
        {/* Fixed Left Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          impersonatedCompany={impersonatedCompany}
          isPlanExpired={isPlanExpired}
        />

        {/* Backdrop overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Dedicated Scrollable Content Viewport */}
        <div className="flex flex-1 flex-col h-full overflow-y-auto overflow-x-hidden min-w-0 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <Navbar
            onMenuClick={() => setSidebarOpen(true)}
            impersonatedCompany={impersonatedCompany}
          />

          <main className="flex-1 p-4 md:p-6 min-w-0">
            {/* ── Subscription Expiry Takeover Screen (Blocks all workspace pages except Plans) ── */}
            {isPlanExpired && !isPlansPage ? (
              <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 py-8 animate-in fade-in slide-in-from-bottom-3 duration-250">
                <div className="w-full max-w-xl bg-white rounded-3xl border border-rose-200 shadow-xl shadow-rose-900/5 p-6 sm:p-8 text-center relative overflow-hidden">
                  {/* Decorative ambient top glow */}
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-500 via-red-600 to-amber-500" />

                  {/* Icon badge */}
                  <div className="mx-auto mb-5 h-16 w-16 rounded-2xl bg-gradient-to-br from-rose-50 to-red-100 border border-rose-200 flex items-center justify-center text-rose-600 shadow-sm">
                    <Lock className="h-8 w-8 stroke-[2.25]" />
                  </div>

                  {/* Pill */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-black uppercase tracking-wider mb-3">
                    <Clock className="h-3.5 w-3.5" />
                    Subscription Plan Expired
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
                    Workspace Access Locked
                  </h2>

                  {/* Subtitle */}
                  <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto mb-6">
                    Your company&apos;s subscription has ended. Access to candidate evaluations, assessment pipelines, question banks, and mailbox synchronization is temporarily on hold until your subscription is renewed.
                  </p>

                  {/* High-trust assurance cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left mb-6 bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-bold text-slate-900 block">100% Data Preserved</span>
                        <span className="text-slate-500 leading-tight">All candidate tests, results, and questions remain secure.</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-bold text-slate-900 block">Instant Activation</span>
                        <span className="text-slate-500 leading-tight">Access is restored immediately upon Razorpay payment capture.</span>
                      </div>
                    </div>
                  </div>

                  {/* Role-specific CTA */}
                  {isOwner ? (
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => router.push("/company/plans")}
                        className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#4E35E8] to-[#6D38F0] hover:from-[#432ec9] hover:to-[#5e2ed3] text-white font-black text-base shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                      >
                        <CreditCard className="h-5 w-5" />
                        <span>Renew Subscription & View Plans</span>
                        <ArrowRight className="h-5 w-5 ml-1" />
                      </button>
                      <p className="text-xs text-slate-400 font-medium">
                        Secure 256-bit encrypted checkout via Razorpay Official Gateway.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-800 text-left flex items-start gap-2.5">
                        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold block">Owner Action Required</strong>
                          <span>Only your primary Workspace Owner has authorization to purchase or renew subscriptions. Please contact them to reactivate team access.</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => router.push("/company/plans")}
                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm shadow-xs transition-colors cursor-pointer"
                      >
                        <span>View Current Plan & Billing Status</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              children
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
