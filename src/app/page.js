"use client";

import { useState } from "react";
import {
  LandingHeader,
  HeroSection,
  ServicesSection,
  AboutSection,
  FaqSection,
  ContactSection,
  LandingFooter,
} from "@/components/landing";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <AboutSection />
      <FaqSection />
      <ContactSection />
      <LandingFooter handleScrollTo={handleScrollTo} />
    </div>
  );
}
