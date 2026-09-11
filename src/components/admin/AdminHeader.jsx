"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, ShieldCheck, LogOut, ChevronDown, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useAdminNav } from "./AdminLayoutClient";
import { useAuth } from "@/features/auth/context/AuthContext";

const AdminHeader = ({
  title = "Platform Master Overview",
  subtitle = "HireQuest Enterprise Platform Live Management",
}) => {
  const { toggleSidebar } = useAdminNav();
  const { user, logout } = useAuth();
  const router = useRouter();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully.");
      router.push("/login");
    } catch {
      toast.error("Logout failed. Clearing session.");
      router.push("/login");
    }
  };

  const resolveAdminName = (u) => {
    if (!u) return "Super Admin";
    if (typeof u === "string") {
      if (u === "Platform Super Admin" || u === "Platform Admin") return "Super Admin";
      return u;
    }
    const rawName =
      (typeof u.name === "string" ? u.name : "") ||
      (typeof u.fullName === "string" ? u.fullName : "") ||
      (u.firstName || u.lastName ? `${u.firstName || ""} ${u.lastName || ""}`.trim() : "") ||
      "";
    if (rawName.trim() && rawName !== "Platform Super Admin" && rawName !== "Platform Admin") {
      return rawName.trim();
    }
    return "Super Admin";
  };

  const adminName = resolveAdminName(user);
  const adminEmail = typeof user?.email === "string" ? user.email : "admin@hirequest.com";
  const initials =
    adminName
      .split(" ")
      .filter(Boolean)
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "SA";

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
        {/* Super Admin User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 shadow-2xs transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            aria-label="User profile menu"
            aria-expanded={isDropdownOpen}
          >
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-tight">
                {adminName}
              </p>
              <p className="text-[10px] text-slate-500 font-medium truncate max-w-[140px]">
                {adminEmail}
              </p>
            </div>
            <ChevronDown
              className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180 text-slate-700" : ""
              }`}
            />
          </button>

          {/* Clean & Minimal Profile Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl shadow-slate-200/60 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Profile Summary */}
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {adminName}
                </p>
                <p className="text-[11px] text-slate-500 font-medium truncate">
                  {adminEmail}
                </p>
                <div className="mt-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/70 text-[9.5px] font-extrabold tracking-wider uppercase">
                    <Shield className="h-2.5 w-2.5" />
                    Super Admin
                  </span>
                </div>
              </div>

              {/* Clean Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              >
                <LogOut className="h-4 w-4 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
