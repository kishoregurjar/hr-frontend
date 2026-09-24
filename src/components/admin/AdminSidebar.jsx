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
  X,
} from "lucide-react";

const NAV_ITEMS = [
  {
    label: "Overview",
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
    label: "Games Engine",
    href: "/admin/games",
    icon: Gamepad2,
  },
  {
    label: "Users & Teams",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
];

const AdminSidebar = ({ isOpen = false, onClose = () => {} }) => {
  const pathname = usePathname();

  const isActive = (item) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col bg-white text-slate-800 border-r border-slate-200/90 transition-transform duration-300 ease-in-out lg:static lg:h-full lg:translate-x-0 shrink-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } font-sans`}
    >
      {/* ── Brand Header ── */}
      <div className="h-[70px] flex items-center justify-between px-5 py-3 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 font-bold text-white shadow-md shadow-blue-500/20">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-slate-900 leading-none">
              HireQuest
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* ── Nav Links ── */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);

          return (
            <Link
              key={item.href}
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
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
};

export default AdminSidebar;
