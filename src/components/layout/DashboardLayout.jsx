"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";

const DashboardLayout = ({ children }) => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [impersonatedCompany, setImpersonatedCompany] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("hq_impersonated_company");
      if (stored) {
        setImpersonatedCompany(JSON.parse(stored));
      }
    } catch {}
  }, []);

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
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#f8fafc] text-slate-900 font-sans antialiased">
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

      <div className="flex flex-1 h-full min-w-0 overflow-hidden">
        {/* Fixed Left Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          impersonatedCompany={impersonatedCompany}
        />

        {/* Backdrop overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Dedicated Scrollable Content Viewport (Invisible Scrollbar with fluid scroll) */}
        <div className="flex flex-1 flex-col h-full overflow-y-auto overflow-x-hidden min-w-0 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <Navbar onMenuClick={() => setSidebarOpen(true)} />

          <main className="flex-1 p-4 md:p-6 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
