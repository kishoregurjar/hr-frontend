"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LandingHeader,
  HeroSection,
  ServicesSection,
  PricingSection,
  AboutSection,
  FaqSection,
  ContactSection,
  LandingFooter,
} from "@/components/landing";

export default function Home() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isTenantDomain, setIsTenantDomain] = useState(false);

  // Client-side defense-in-depth: If customer tenant domain mounts public home, redirect to workspace
  useEffect(() => {
    if (typeof window !== "undefined") {
      const host = window.location.hostname.toLowerCase();
      const configuredRoot = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "hirequest.com").toLowerCase();
      const isPlatformRoot =
        [
          "localhost",
          "127.0.0.1",
          "hirequest.com",
          "www.hirequest.com",
          "app.hirequest.com",
          "admin.hirequest.com",
          configuredRoot,
          `www.${configuredRoot}`,
          `app.${configuredRoot}`,
          `admin.${configuredRoot}`,
        ].includes(host) || host.endsWith(".vercel.app");

      if (!isPlatformRoot && !host.startsWith("admin.") && !host.startsWith("app.")) {
        setIsTenantDomain(true);
        router.replace("/login");
      }
    }
  }, [router]);

  // Smooth scroll handler accounting for sticky header offset
  const handleScrollTo = (e, id) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 90;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  if (isTenantDomain) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-[#e8f2fe] text-slate-800 overflow-x-hidden font-sans scroll-smooth">
      {/* Decorative background blobs */}
      <div className="absolute top-20 left-10 w-48 h-48 bg-[#d0e5fc] rounded-full filter blur-xl opacity-70 -z-10 animate-pulse" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-[#d8ebff] rounded-full filter blur-2xl opacity-60 -z-10" />
      <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-[#e0efff] rounded-full filter blur-lg opacity-80 -z-10" />

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-3 sm:py-4 md:px-8">
        <LandingHeader
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          handleScrollTo={handleScrollTo}
        />
        <HeroSection />
      </div>

      <ServicesSection />
      <PricingSection handleScrollTo={handleScrollTo} />
      <AboutSection />
      <FaqSection />
      <ContactSection />
      <LandingFooter handleScrollTo={handleScrollTo} />
    </div>
  );
}
