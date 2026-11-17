"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LandingHeader,
  HeroSection,
  CyberWaveGrid,
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
    <div className="relative min-h-screen bg-[#f8fafc] text-slate-800 overflow-x-hidden font-sans scroll-smooth">
      {/* Edge-to-Edge Full Viewport 3D Cyber Wave Mesh (TechTantra Style) */}
      <div className="absolute top-0 left-0 right-0 w-full h-[100vh] min-h-[700px] max-h-[1050px] pointer-events-none overflow-hidden z-0">
        <CyberWaveGrid />
      </div>

      {/* Main Container */}
      <div className="relative z-10 mx-auto max-w-7xl px-3 sm:px-6 py-3 sm:py-4 md:px-8">
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
