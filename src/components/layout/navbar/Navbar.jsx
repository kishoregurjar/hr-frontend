"use client";

import { Menu, ShieldCheck } from "lucide-react";
import { usePathname } from "next/navigation";

import { PAGE_TITLES } from "@/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Navbar = ({ onMenuClick, impersonatedCompany = null }) => {
  const pathname = usePathname();
  const pageTitle = PAGE_TITLES[pathname] || "Dashboard";

  return (
    <header className="h-[64px] min-h-[64px] max-h-[64px] shrink-0 border-b border-slate-200/80 bg-white px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between sticky top-0 z-30 font-sans shadow-2xs gap-3 box-border">
      {/* Left Section: Mobile Menu + Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden p-2 h-9 w-9 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition shrink-0 border border-slate-200/80 cursor-pointer"
          aria-label="Open Mobile Menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2.5 min-w-0">
          <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight truncate leading-tight">
            {pageTitle}
          </h1>

          {/* Impersonation Banner for Super Admin if inspecting tenant */}
          {impersonatedCompany && (
            <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-extrabold text-[10px] sm:text-[10.5px] gap-1 shrink-0 shadow-2xs">
              <ShieldCheck className="h-3 w-3 text-amber-600" />
              Impersonating: {impersonatedCompany.name}
            </Badge>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
