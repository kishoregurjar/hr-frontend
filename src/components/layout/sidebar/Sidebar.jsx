"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Send,
  Trophy,
  Brain,
  HelpCircle,
  LogOut,
  Building2,
  X,
} from "lucide-react";
import { useAuth } from "@/features/auth/context";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const NAV_ITEMS = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    title: "Candidates",
    href: "/candidates",
    icon: Users,
  },
  {
    title: "Assessments",
    href: "/assessments",
    icon: FileText,
  },
  {
    title: "Invitations",
    href: "/invitations",
    icon: Send,
  },
  {
    title: "Results & Ranking",
    href: "/results",
    icon: Trophy,
  },
  {
    title: "Question Bank",
    href: "/question-bank",
    icon: HelpCircle,
  },
  {
    title: "Cognitive Games",
    href: "/games",
    icon: Brain,
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const displayName = user?.name || user?.fullName || "Sarah Jenkins";
  const userEmail = user?.email || "sarah.jenkins@techcorp.io";
  const companyName = user?.company || "TechCorp Solutions";

  const isActive = (item) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  const handleConfirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      setShowLogoutConfirm(false);
    } catch {
      setShowLogoutConfirm(false);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col bg-white text-slate-800 border-r border-slate-200/90 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* ── 1. Top Logo Header ── */}
        <div className="h-18 flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 font-extrabold text-sm text-white shadow-md shadow-blue-500/20">
              HQ
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 leading-none block">
                AssessFlow
              </span>
              <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                Multi-Tenant Screening
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── 2. Active Tenant Card ── */}
        <div className="px-4 py-2">
          <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Active Tenant
              </span>
              <span className="text-[9px] font-extrabold uppercase bg-blue-50 text-blue-700 border border-blue-200/80 px-1.5 py-0.5 rounded tracking-wider">
                Enterprise
              </span>
            </div>
            <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
              <Building2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              <span className="truncate">{companyName}</span>
            </div>
          </div>
        </div>

        {/* ── 3. Navigation Links ── */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);

            return (
              <Link
                key={item.title}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    active ? "text-white" : "text-slate-400"
                  }`}
                />
                <span className="truncate">{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* ── 4. User Footer with Logout Button ── */}
        <div className="p-3 border-t border-slate-200/80 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate leading-none">
                {displayName}
              </p>
              <p className="text-[10px] text-slate-500 truncate mt-1">
                {userEmail}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* ── Logout Confirmation Dialog Modal ── */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6">
          <DialogHeader className="space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
              <LogOut className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-lg font-extrabold text-slate-900">
              Confirm Sign Out
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-slate-500">
              Are you sure you want to log out of your <span className="font-semibold text-slate-700">{companyName}</span> account? You will need to sign in again to access the candidate screening portal.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4 sm:justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowLogoutConfirm(false)}
              className="w-full sm:w-auto h-10 px-5 rounded-xl border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmLogout}
              disabled={isLoggingOut}
              className="w-full sm:w-auto h-10 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              {isLoggingOut ? "Signing Out..." : "Yes, Sign Out"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
