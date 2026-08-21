"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants";

export default function LandingHeader({
  mobileMenuOpen,
  setMobileMenuOpen,
  handleScrollTo,
}) {
  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between py-2.5 sm:py-3.5 backdrop-blur-md bg-[#e8f2fe]/90 rounded-2xl px-3 sm:px-6 border border-blue-100/60 shadow-sm gap-2">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-extrabold text-base sm:text-xl shadow-md">
            H
          </div>
          <span className="text-base sm:text-xl font-bold tracking-tight text-slate-900">
            HireQuest
          </span>
        </Link>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-semibold text-slate-600">
          <a
            href="#about"
            onClick={(e) => handleScrollTo(e, "about")}
            className="hover:text-blue-600 transition-colors"
          >
            ABOUT US
          </a>
          <a
            href="#services"
            onClick={(e) => handleScrollTo(e, "services")}
            className="hover:text-blue-600 transition-colors"
          >
            SERVICES
          </a>
          <a
            href="#faq"
            onClick={(e) => handleScrollTo(e, "faq")}
            className="hover:text-blue-600 transition-colors"
          >
            FAQ
          </a>
          <a
            href="#contact"
            onClick={(e) => handleScrollTo(e, "contact")}
            className="hover:text-blue-600 transition-colors"
          >
            CONTACT
          </a>
        </nav>

        {/* Right Action buttons */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          <Link
            href="/login"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className:
                "border-blue-600 text-blue-600 hover:bg-blue-50 rounded-md font-semibold px-2.5 sm:px-4 text-xs sm:text-sm h-8 sm:h-10",
            })}
          >
            Sign In
          </Link>

          <Link
            href={ROUTES.DASHBOARD}
            className={buttonVariants({
              variant: "default",
              size: "sm",
              className:
                "bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 sm:px-5 shadow-md font-semibold text-xs sm:text-sm h-8 sm:h-10",
            })}
          >
            Dashboard
          </Link>

          {/* Mobile Menu Toggle Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8 text-slate-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-blue-100 shadow-lg space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <a
            href="#about"
            onClick={(e) => handleScrollTo(e, "about")}
            className="block font-semibold text-sm text-slate-700 hover:text-blue-600 py-1.5 px-2 rounded-lg hover:bg-blue-50"
          >
            ABOUT US
          </a>
          <a
            href="#services"
            onClick={(e) => handleScrollTo(e, "services")}
            className="block font-semibold text-sm text-slate-700 hover:text-blue-600 py-1.5 px-2 rounded-lg hover:bg-blue-50"
          >
            SERVICES
          </a>
          <a
            href="#faq"
            onClick={(e) => handleScrollTo(e, "faq")}
            className="block font-semibold text-sm text-slate-700 hover:text-blue-600 py-1.5 px-2 rounded-lg hover:bg-blue-50"
          >
            FAQ
          </a>
          <a
            href="#contact"
            onClick={(e) => handleScrollTo(e, "contact")}
            className="block font-semibold text-sm text-slate-700 hover:text-blue-600 py-1.5 px-2 rounded-lg hover:bg-blue-50"
          >
            CONTACT
          </a>
        </div>
      )}
    </>
  );
}
