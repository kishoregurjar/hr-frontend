"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Gamepad2,
  Users,
  BarChart3,
  Shield,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

const NAV_ITEMS = [
  {
    label: "Platform Overview",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Companies & Tenants",
    href: "/admin/companies",
    icon: Building2,
  },
  {
    label: "Global Games Engine",
    href: "/admin/games",
    icon: Gamepad2,
  },
  {
    label: "Platform Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Platform Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
];

const AdminSidebar = () => {
  const pathname = usePathname();

  const isActive = (item) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200/90 bg-white text-slate-800 flex flex-col min-h-screen font-sans">
      {/* ── Brand Header ── */}
      <div className="h-18 flex items-center gap-3 px-5 pt-5 pb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 font-bold text-white shadow-md shadow-blue-500/20">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <span className="font-extrabold text-base tracking-tight text-slate-900 flex items-center gap-1.5 leading-none">
            Minders Admin
            <span className="text-[9px] font-extrabold uppercase bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded tracking-wider">
              SUPER
            </span>
          </span>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Platform Master Console
          </p>
        </div>
      </div>

      {/* ── Navigation Links ── */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Management
        </p>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);

          return (
            <Link
              key={item.href}
              href={item.href}
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
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* ── Quick Switch to HR Portal ── */}
      <div className="p-3.5 border-t border-slate-200/80">
        <div className="rounded-xl bg-gradient-to-br from-blue-50/90 to-indigo-50/60 border border-blue-200/70 p-3.5 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
            <p className="text-xs font-bold text-slate-900">
              HR Recruitment Mode
            </p>
          </div>
          <p className="text-[11px] text-slate-600 leading-tight">
            Switch from Super Admin to HR Portal to test candidate assessments.
          </p>
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-white hover:bg-blue-50 text-xs font-bold text-blue-700 border border-blue-200 shadow-2xs transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Open HR Portal
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
