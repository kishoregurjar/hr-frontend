"use client";

import Link from "next/link";
import { MapPin, Mail, Phone, Clock, ShieldCheck } from "lucide-react";

export default function LandingFooter({ handleScrollTo }) {
  return (
    <footer className="bg-[#050b1d] text-slate-400 border-t border-slate-800/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 py-14 sm:py-16">
          
          {/* Column 1: Brand Logo, Bio & Social Media (Span 4) */}
          <div className="lg:col-span-4 space-y-5">
            {/* White Rounded Brand Badge (TechTantra Inspired) */}
            <div className="inline-flex items-center gap-2.5 bg-white py-2 px-3.5 rounded-xl shadow-md border border-slate-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-extrabold text-base shadow-sm">
                H
              </div>
              <span className="text-lg font-black tracking-tight text-slate-900">
                Hire<span className="text-blue-600">Quest</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-light">
              Pioneering next-generation hiring automation. We replace static resumes with interactive cognitive games, objective AI-weighted scoring, and proctoring session signals for modern enterprises globally.
            </p>

            {/* Circular Social Buttons */}
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-full bg-slate-800/90 text-slate-300 hover:text-white hover:bg-blue-600 transition-all duration-300 flex items-center justify-center border border-slate-700/60 hover:border-blue-500 shadow-sm hover:scale-110"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.3a1.64 1.64 0 0 0-1.66 1.64 1.66 1.66 0 0 0 1.66 1.65 1.64 1.64 0 0 0 1.64-1.65A1.64 1.64 0 0 0 7.86 6.3Z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="w-9 h-9 rounded-full bg-slate-800/90 text-slate-300 hover:text-white hover:bg-blue-600 transition-all duration-300 flex items-center justify-center border border-slate-700/60 hover:border-blue-500 shadow-sm hover:scale-110"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="w-9 h-9 rounded-full bg-slate-800/90 text-slate-300 hover:text-white hover:bg-blue-600 transition-all duration-300 flex items-center justify-center border border-slate-700/60 hover:border-blue-500 shadow-sm hover:scale-110"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-full bg-slate-800/90 text-slate-300 hover:text-white hover:bg-blue-600 transition-all duration-300 flex items-center justify-center border border-slate-700/60 hover:border-blue-500 shadow-sm hover:scale-110"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: SITEMAP (Span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white font-mono">
              Sitemap
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="hover:text-blue-400 transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  onClick={(e) => handleScrollTo?.(e, "about")}
                  className="hover:text-blue-400 transition-colors"
                >
                  About Platform
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  onClick={(e) => handleScrollTo?.(e, "services")}
                  className="hover:text-blue-400 transition-colors"
                >
                  Hiring Capabilities
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  onClick={(e) => handleScrollTo?.(e, "pricing")}
                  className="hover:text-blue-400 transition-colors"
                >
                  Pricing & Plans
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  onClick={(e) => handleScrollTo?.(e, "faq")}
                  className="hover:text-blue-400 transition-colors"
                >
                  Questions & FAQ
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  onClick={(e) => handleScrollTo?.(e, "contact")}
                  className="hover:text-blue-400 transition-colors"
                >
                  Contact Support
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: OUR CAPABILITIES (Span 3) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white font-mono">
              Our Capabilities
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="hover:text-blue-400 transition-colors cursor-pointer">
                Cognitive Game Suite (5 Games)
              </li>
              <li className="hover:text-blue-400 transition-colors cursor-pointer">
                Multi-Round Pipeline Automation
              </li>
              <li className="hover:text-blue-400 transition-colors cursor-pointer">
                Smart 40/60 AI Weighted Scoring
              </li>
              <li className="hover:text-blue-400 transition-colors cursor-pointer">
                Session Integrity & Anti-Cheat
              </li>
              <li className="hover:text-blue-400 transition-colors cursor-pointer">
                Real-Time Candidate Leaderboard
              </li>
              <li className="hover:text-blue-400 transition-colors cursor-pointer">
                Automated Token Invitation Links
              </li>
            </ul>
          </div>

          {/* Column 4: CONTACT & OFFICE ADDRESS */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white font-mono">
              Contact & Office
            </h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <p className="font-semibold text-slate-200">Office Address:</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    2, Annapurna Rd, near Luv kush bakery, Prabhu Nagar, Indore, Madhya Pradesh 452009
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <a
                  href="tel:07000961866"
                  className="text-xs text-slate-200 hover:text-blue-400 font-medium transition-colors"
                >
                  070009 61866
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span className="text-[11px] text-slate-400">
                  <span className="text-emerald-400 font-semibold">Open</span> • Closes 7:30 pm
                </span>
              </div>

              <div className="flex items-start gap-2.5 pt-1">
                <Mail className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-[11px]">
                  <p>
                    <a
                      href="mailto:support@hirequest.com"
                      className="hover:text-blue-400 transition-colors"
                    >
                      support@hirequest.com
                    </a>
                  </p>
                </div>
              </div>

              <div className="pt-1 text-[11px] text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>Enterprise Verified Business</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="border-t border-slate-800/80 py-6 sm:py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} HireQuest Technologies. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-400">
            <a href="#" className="hover:text-blue-400 transition-colors">
              Privacy Policy
            </a>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <a href="#" className="hover:text-blue-400 transition-colors">
              Terms of Service
            </a>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <a href="#" className="hover:text-blue-400 transition-colors">
              Security & Compliance
            </a>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <a href="#" className="hover:text-blue-400 transition-colors">
              Cookie Controls
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
