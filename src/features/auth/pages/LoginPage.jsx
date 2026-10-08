"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { LoginForm } from "../components";
import { useAuth } from "../context";
import { clearAllAuthStorage } from "@/lib/api/auth";

const LoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isActivated = searchParams.get("activated") === "true";
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    if (isActivated) {
      clearAllAuthStorage();
      try {
        logout();
      } catch {}
      return;
    }

    if (!isLoading && isAuthenticated && user) {
      const role = (user?.role || "").toUpperCase();
      const isSuperAdmin =
        role === "SUPER_ADMIN" ||
        role === "PLATFORM_ADMIN" ||
        user?.email?.toLowerCase().includes("admin") ||
        user?.isSuperAdmin;

      if (isSuperAdmin) {
        router.push("/admin");
      } else if (role === "CANDIDATE") {
        router.push("/take-test");
      } else {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, isLoading, user, router, isActivated, logout]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#eff3ff] via-[#f5f3ff] to-[#f8f9fe] flex flex-col justify-between p-6 sm:p-10 lg:p-14 relative overflow-hidden font-sans">
      {/* Subtle decorative background blur orbs */}
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-0 h-96 w-96 rounded-full bg-purple-200/35 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-indigo-100/50 blur-3xl pointer-events-none" />

      {/* Top Header: HireQuest Logo */}
      <div className="relative z-10">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <rect x="4" y="4" width="4.5" height="16" rx="2.25" />
              <rect x="15.5" y="4" width="4.5" height="16" rx="2.25" />
              <rect x="7" y="10" width="10" height="4" rx="2" />
            </svg>
          </div>
          <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            HireQuest
          </span>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="relative z-10 flex-1 flex items-center justify-center py-8 lg:py-12">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Hero Section */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-8">
            <div className="space-y-5">
              <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black tracking-tight text-slate-900 leading-[1.1]">
                Find <br />
                Great Talent <br />
                <span className="text-blue-600">Faster</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-500 font-normal max-w-lg leading-relaxed">
                A modern recruitment platform to post jobs, manage candidates, conduct assessments and hire the best talent.
              </p>
            </div>

            {/* Social Proof Avatars */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center -space-x-2.5">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                  alt="Candidate avatar"
                  className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-xs"
                />
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Candidate avatar"
                  className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-xs"
                />
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                  alt="Candidate avatar"
                  className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-xs"
                />
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Trusted by 500+ companies
              </p>
            </div>
          </div>

          {/* Right Floating Card Section */}
          <div className="lg:col-span-6 xl:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-[430px] rounded-3xl bg-white p-7 sm:p-9 shadow-2xl shadow-indigo-100/80 border border-slate-100">
              <div className="mb-6 space-y-1">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  Welcome Back
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 font-normal">
                  Sign in to your HireQuest account
                </p>
              </div>

              <LoginForm />
            </div>
          </div>
        </div>
      </div>

      {/* Empty footer spacer to maintain balance */}
      <div className="relative z-10 text-xs text-slate-400 hidden lg:block">
        © {new Date().getFullYear()} HireQuest. All rights reserved.
      </div>
    </div>
  );
};

export default LoginPage;
