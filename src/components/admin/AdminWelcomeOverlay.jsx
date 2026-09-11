"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Shield, Sparkles, CheckCircle2, Zap } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";

export default function AdminWelcomeOverlay() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [isVisible, setIsVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    "Verifying Master Credentials...",
    "Synchronizing Multi-Tenant Telemetry...",
    "Launching Platform Master Console...",
  ];

  useEffect(() => {
    // Check if welcome is requested via searchParam or sessionStorage
    const isWelcomeParam = searchParams.get("welcome") === "true";
    const isWelcomePending =
      typeof window !== "undefined"
        ? sessionStorage.getItem("admin_welcome_pending") === "true"
        : false;

    if (isWelcomeParam || isWelcomePending) {
      setIsVisible(true);
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("admin_welcome_pending");
      }

      // Progress through telemetry steps
      const timer1 = setTimeout(() => setStepIndex(1), 500);
      const timer2 = setTimeout(() => setStepIndex(2), 1000);

      // Start fade-out at 1.4s
      const timer3 = setTimeout(() => {
        setIsFadingOut(true);
      }, 1400);

      // Unmount completely at 1.8s
      const timer4 = setTimeout(() => {
        setIsVisible(false);
        // Clean URL without full page reload
        if (isWelcomeParam) {
          router.replace("/admin");
        }
      }, 1800);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    }
  }, [searchParams, router]);

  if (!isVisible) return null;

  const adminName =
    (user?.name && user.name !== "Platform Super Admin" ? user.name : null) ||
    (user?.fullName && user.fullName !== "Platform Super Admin" ? user.fullName : null) ||
    "Super Admin";

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      router.replace("/admin");
    }, 200);
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-2xl transition-all duration-400 font-sans select-none ${
        isFadingOut ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Ambient Glowing Background Beams */}
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none animate-pulse delay-700" />

      {/* Main Glassmorphic Card Container */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg mx-auto space-y-6">
        {/* Glowing Shield Icon with Pulsing Rings */}
        <div className="relative flex items-center justify-center">
          <div className="absolute h-24 w-24 rounded-3xl bg-blue-500/20 animate-ping duration-1000" />
          <div className="absolute h-28 w-28 rounded-full bg-gradient-to-tr from-blue-500/30 to-indigo-500/20 blur-lg" />
          
          <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 text-white shadow-2xl shadow-blue-500/40 border border-white/20">
            <Shield className="h-10 w-10 text-white drop-shadow-md animate-bounce duration-1000" />
            <Sparkles className="h-5 w-5 text-amber-300 absolute -top-1 -right-1 animate-spin duration-3000" />
          </div>
        </div>

        {/* Welcome Tag & Heading */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-[11px] font-extrabold tracking-widest text-blue-300 uppercase shadow-inner">
            <Zap className="h-3 w-3 text-amber-400" />
            Platform Master Access
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent">
            Welcome, {adminName}
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-sm mx-auto">
            Initializing HireQuest Multi-Tenant Master Console
          </p>
        </div>

        {/* Dynamic Progress Bar & Step Indicator */}
        <div className="w-full max-w-xs space-y-2.5 pt-2">
          <div className="relative h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 rounded-full transition-all duration-500 ease-out shadow-sm shadow-blue-500"
              style={{
                width: stepIndex === 0 ? "35%" : stepIndex === 1 ? "75%" : "100%",
              }}
            />
          </div>

          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-blue-300/90">
            <CheckCircle2 className="h-3.5 w-3.5 text-blue-400 animate-spin" />
            <span className="transition-all duration-300">{steps[stepIndex]}</span>
          </div>
        </div>

        {/* Quick Skip Option */}
        <button
          type="button"
          onClick={handleSkip}
          className="text-[11px] text-slate-500 hover:text-slate-300 font-semibold transition cursor-pointer pt-2"
        >
          Skip animation →
        </button>
      </div>
    </div>
  );
}
