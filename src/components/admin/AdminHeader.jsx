"use client";

import { Search, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AdminHeader = ({
  title = "Platform Master Overview",
  subtitle = "Minders World Recruitment Ecosystem Live Statistics",
}) => {
  return (
    <header className="h-16 border-b border-slate-200/80 bg-white px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 font-sans shadow-2xs">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {title}
          </h1>
          <Badge className="bg-blue-50 text-blue-700 border-blue-200/80 text-[10.5px] font-extrabold gap-1">
            <ShieldCheck className="h-3 w-3 text-blue-600" />
            Super Admin
          </Badge>
        </div>
        <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative hidden md:block">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search companies, games, users..."
            className="h-9 w-64 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition"
          />
        </div>

        {/* Super Admin User Chip */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 shadow-2xs">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            SA
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-tight">
              Platform Admin
            </p>
            <p className="text-[10px] text-slate-500 font-medium">
              Minders World HQ
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
