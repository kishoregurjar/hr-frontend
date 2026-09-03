"use client";

import { Menu, Search, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAdminNav } from "./AdminLayoutClient";

const AdminHeader = ({
  title = "Platform Master Overview",
  subtitle = "Minders World Recruitment Ecosystem Live Statistics",
}) => {
  const { toggleSidebar } = useAdminNav();

  return (
    <header className="min-h-16 border-b border-slate-200/80 bg-white px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between sticky top-0 z-30 font-sans shadow-2xs gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition shrink-0 border border-slate-200/80 cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight truncate">
              {title}
            </h1>
            <Badge className="bg-blue-50 text-blue-700 border-blue-200/80 text-[10px] sm:text-[10.5px] font-extrabold gap-1 shrink-0">
              <ShieldCheck className="h-3 w-3 text-blue-600" />
              Super Admin
            </Badge>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5 truncate max-w-xs sm:max-w-md md:max-w-none">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {/* Search Bar (hidden on mobile, visible on desktop) */}
        <div className="relative hidden xl:block">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search companies, games, users..."
            className="h-9 w-60 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition"
          />
        </div>

        {/* Super Admin User Chip */}
        <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 shadow-2xs">
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
            SA
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-tight">
              Platform Admin
            </p>
            <p className="text-[10px] text-slate-500 font-medium truncate max-w-[120px]">
              Minders World HQ
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
