"use client";

import { useRef } from "react";
import { useAuth } from "@/features/auth/context";
import DashboardMetricCards from "@/features/dashboard/components/DashboardMetricCards";
import RecentResultsTable from "@/features/dashboard/components/RecentResultsTable";

export default function DashboardPage() {
  const { user } = useAuth();

  // Scroll & Parallax Refs
  const scrollContainerRef = useRef(null);
  const farBgRef = useRef(null);
  const midHeroRef = useRef(null);

  const rawName =
    (typeof user?.name === "string" ? user.name : "") ||
    (typeof user?.fullName === "string" ? user.fullName : "") ||
    (user?.email ? user.email.split("@")[0] : "");
  const firstName = String(rawName).replace(/\s+user$/i, "").trim().split(" ")[0] || "Rohit";

  const companyName =
    user?.companyName ||
    user?.company?.name ||
    user?.company ||
    (typeof window !== "undefined" ? localStorage.getItem("companyName") : null) ||
    "Facebook Company";

  // ── Parallax Scroll Handler (Background & Foreground at different speeds) ──
  const handleScroll = () => {
    const scrollY = scrollContainerRef.current?.scrollTop || 0;

    // 1. Far background decorative rings & ambient orbs inside the hero banner (slowest, 0.58x counter-lag)
    if (farBgRef.current) {
      const orbTranslate = scrollY * 0.58;
      const orbRotate = scrollY * 0.05;
      const orbScale = 1 + scrollY * 0.0003;
      farBgRef.current.style.transform = `translate3d(0, ${orbTranslate}px, 0) scale(${orbScale}) rotate(${orbRotate}deg)`;
    }

    // 2. Midground Hero Content: Title, subtitle, badge (0.42x counter-lag + 3D depth push)
    if (midHeroRef.current) {
      const heroProgress = Math.min(scrollY / 450, 1);
      const heroTranslate = scrollY * 0.42;
      const heroOpacity = Math.max(1 - heroProgress * 0.75, 0.2);
      const heroScale = 1 - heroProgress * 0.06;
      midHeroRef.current.style.transform = `translate3d(0, ${heroTranslate}px, 0) scale(${heroScale})`;
      midHeroRef.current.style.opacity = heroOpacity;
    }
  };

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="-m-4 md:-m-6 h-[calc(100dvh-64px)] max-h-[calc(100dvh-64px)] overflow-y-auto overflow-x-hidden relative bg-[#f8fafc] no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      {/* ── Layer 1 & 2: Parallax Hero Header ── */}
      <div className="relative bg-gradient-to-r from-[#4E35E8] via-[#6D38F0] to-[#CF2E9F] text-white pt-10 pb-36 md:pb-40 px-6 md:px-12 overflow-hidden shadow-lg select-none">
        
        {/* Far Background: Rotating Ambient Orbs & Concentric Geometric Rings */}
        <div
          ref={farBgRef}
          className="absolute inset-0 pointer-events-none will-change-transform"
          style={{ transform: "translate3d(0, 0, 0)" }}
        >
          {/* Glowing Ambient Radial Glow */}
          <div className="absolute -top-28 -right-28 w-[450px] h-[450px] rounded-full bg-white/12 blur-3xl" />

          {/* Concentric 3D Rings */}
          <div className="absolute -top-16 -right-16 w-[380px] h-[380px] rounded-full border border-white/20" />
          <div className="absolute top-10 right-16 w-[260px] h-[260px] rounded-full border border-white/15" />
          <div className="absolute top-28 right-36 w-[140px] h-[140px] rounded-full border border-white/10" />

          {/* Floating Subtle Shimmer Sparks */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-white/40 blur-[1px] animate-pulse" />
          <div className="absolute top-1/3 left-2/3 w-2.5 h-2.5 rounded-full bg-pink-200/50 blur-[1px] animate-pulse" />
        </div>

        {/* Midground: Hero Content (0.42x Parallax Speed) */}
        <div
          ref={midHeroRef}
          className="max-w-7xl mx-auto space-y-2 relative z-10 will-change-transform"
          style={{ transform: "translate3d(0, 0, 0)" }}
        >
          {/* Company Tag */}
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-white/75 drop-shadow-xs">
            {companyName}
          </p>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight drop-shadow-sm">
            Dashboard
          </h1>

          {/* Subtitle */}
          <p className="text-white/85 text-xs sm:text-sm font-medium leading-relaxed max-w-2xl">
            Welcome back, {firstName} - aaj ka recruitment overview
          </p>
        </div>
      </div>

      {/* ── Layer 3: Foreground (1.0x Normal Speed - Overlapping 4 Stat Cards & Results Table) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 md:-mt-24 relative z-20 space-y-6 pb-20">
        
        {/* ── 1. 4 KPI Metric Cards ── */}
        <DashboardMetricCards />

        {/* ── 2. Recent Assessment Results (Full Width) ── */}
        <div className="w-full">
          <RecentResultsTable />
        </div>
      </div>
    </div>
  );
}
