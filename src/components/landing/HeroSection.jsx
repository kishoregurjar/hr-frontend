"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, LayoutDashboard, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants";
import { useAuth } from "@/features/auth/context/AuthContext";
import hiringHero from "@/assets/illustrations/hiring_hero.png";

export default function HeroSection() {
  const { user, isAuthenticated, isLoading } = useAuth();

  const isSuperAdmin =
    user?.role === "SUPER_ADMIN" ||
    user?.role === "PLATFORM_ADMIN" ||
    user?.email?.toLowerCase()?.includes("admin");

  return (
    <main className="grid gap-8 lg:gap-12 lg:grid-cols-2 items-center min-h-[calc(100vh-140px)] py-8">
      {/* Left Column */}
      <div className="space-y-4 sm:space-y-6 max-w-xl">
        <h2 className="text-blue-600 text-base sm:text-lg md:text-xl font-bold tracking-wide uppercase">
          Hiring Automation
        </h2>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight">
          RECRUIT <br />
          <span className="text-blue-600">SMARTER</span>
        </h1>

        {/* Paragraph: Static plain text */}
        <div>
          <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium leading-relaxed">
            Streamline your hiring workflow with HireQuest. Automate candidate screening by creating interactive assessments, sending test links directly to applicants&apos; emails, and tracking real-time analytics in a unified HR dashboard. Identify top talent instantly without the manual{" "}
            <span className="font-bold text-blue-600">
              sorting hassle.
            </span>
          </p>
        </div>

        <div className="pt-2 sm:pt-4 flex flex-wrap items-center gap-4">
          {!isLoading && isAuthenticated && user ? (
            <Link
              href={isSuperAdmin ? "/admin" : ROUTES.DASHBOARD}
              className={buttonVariants({
                variant: "default",
                size: "lg",
                className:
                  "w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold tracking-wide text-xs sm:text-sm px-6 sm:px-8 py-5 sm:py-6 rounded-full shadow-lg hover:shadow-blue-500/20 transition-all hover:scale-105 justify-center gap-2 cursor-pointer",
              })}
            >
              {isSuperAdmin ? (
                <ShieldCheck className="h-4 w-4 text-white" />
              ) : (
                <LayoutDashboard className="h-4 w-4 text-white" />
              )}
              <span>{isSuperAdmin ? "OPEN ADMIN CONSOLE" : "OPEN MY DASHBOARD"}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              href="/login"
              className={buttonVariants({
                variant: "default",
                size: "lg",
                className:
                  "w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold tracking-wide text-xs sm:text-sm px-7 sm:px-9 py-5 sm:py-6 rounded-full shadow-lg hover:shadow-blue-500/25 transition-all hover:scale-105 justify-center gap-2 cursor-pointer",
              })}
            >
              <span>SIGN IN TO WORKSPACE</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Right Column */}
      <div className="relative flex justify-center items-center py-4">
        <div className="relative w-full max-w-md h-[260px] sm:h-[380px] md:h-[400px] drop-shadow-xl hover:scale-102 transition-transform duration-500">
          <Image
            src={hiringHero}
            alt="HR hiring automation team illustration"
            fill
            priority
            className="object-contain"
          />
        </div>
      </div>
    </main>
  );
}
