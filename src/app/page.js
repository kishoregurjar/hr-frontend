"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Brain,
  CheckCircle2,
  ChevronDown,
  Clock,
  Gamepad2,
  Mail,
  MapPin,
  Menu,
  MessageSquare,
  Send,
  ShieldAlert,
  Sparkles,
  X,
  Zap,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ROUTES } from "@/constants";
import hiringHero from "@/assets/illustrations/hiring_hero.png";

export default function Home() {
  const smarterWord = "SMARTER";
  const typewriterText = "sorting hassle.";

  // Typewriter states
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

  // FAQ Accordion state
  const [openFaq, setOpenFaq] = useState(0);

  // Mobile navigation menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Contact form submission feedback
  const [contactSubmitted, setContactSubmitted] = useState(false);

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

  // Typewriter effect loop
  useEffect(() => {
    const handleTyping = () => {
      if (!isDeleting) {
        setDisplayedText(typewriterText.substring(0, displayedText.length + 1));
        if (displayedText === typewriterText) {
          setTypingSpeed(2500);
          setIsDeleting(true);
        } else {
          setTypingSpeed(120);
        }
      } else {
        setDisplayedText(typewriterText.substring(0, displayedText.length - 1));
        if (displayedText === "") {
          setIsDeleting(false);
          setTypingSpeed(600);
        } else {
          setTypingSpeed(60);
        }
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, typingSpeed]);

  const letterVariants = {
    animate: (index) => ({
      y: [0, -10, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
        delay: index * 0.15,
      },
    }),
  };

  const services = [
    {
      icon: Gamepad2,
      title: "Cognitive Game Suite",
      description:
        "Evaluate candidate memory, spatial logic, and deduction speed with 5 interactive cognitive games.",
      tag: "Gamified Screening",
    },
    {
      icon: Zap,
      title: "Multi-Round Automation",
      description:
        "Automate candidate pipeline advancement from Round 1 Screening to Technical Assessments and Interviews.",
      tag: "Workflow Automation",
    },
    {
      icon: Brain,
      title: "Smart Weighted Scoring",
      description:
        "Customizable 40/60 scoring engine calculating weighted percentiles and detailed section scorecards.",
      tag: "AI Scoring",
    },
    {
      icon: ShieldAlert,
      title: "Session Integrity Signals",
      description:
        "Non-punitive tab switch, focus loss, and fullscreen exit logging for HR candidate context review.",
      tag: "Proctoring Context",
    },
  ];

  const faqs = [
    {
      question: "How do game-based assessments evaluate candidates?",
      answer:
        "Game-based assessments measure core cognitive traits such as working memory, spatial reasoning, numerical reaction speed, and logical deduction under timed conditions.",
    },
    {
      question: "Can HR customize question and game weightage?",
      answer:
        "Yes! HR recruiters can adjust quiz weightage (e.g. 40%) and game weightage (e.g. 60%) in the Assessment Settings step to match role requirements.",
    },
    {
      question: "Are tab switches recorded during candidate tests?",
      answer:
        "Yes. HireQuest non-punitively tracks tab switches, window blur events, and fullscreen exits, presenting an Integrity Signal Summary for HR review.",
    },
    {
      question: "How long are candidate assessment links valid?",
      answer:
        "Candidate invitation links are valid for 3 days by default. HR can easily resend expired links to generate a new valid token.",
    },
  ];

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => setContactSubmitted(false), 4000);
  };

  return (
    <div className="relative min-h-screen bg-[#e8f2fe] text-slate-800 overflow-x-hidden font-sans scroll-smooth">
      {/* Decorative background blobs */}
      <div className="absolute top-20 left-10 w-48 h-48 bg-[#d0e5fc] rounded-full filter blur-xl opacity-70 -z-10 animate-pulse" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-[#d8ebff] rounded-full filter blur-2xl opacity-60 -z-10" />
      <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-[#e0efff] rounded-full filter blur-lg opacity-80 -z-10" />

      {/* Main Header Container */}
      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-3 sm:py-4 md:px-8">
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
                className: "border-blue-600 text-blue-600 hover:bg-blue-50 rounded-md font-semibold px-2.5 sm:px-4 text-xs sm:text-sm h-8 sm:h-10",
              })}
            >
              Sign In
            </Link>

            <Link
              href={ROUTES.DASHBOARD}
              className={buttonVariants({
                variant: "default",
                size: "sm",
                className: "bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 sm:px-5 shadow-md font-semibold text-xs sm:text-sm h-8 sm:h-10",
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

        {/* Hero split-layout */}
        <main className="grid gap-8 lg:gap-12 lg:grid-cols-2 items-center min-h-[calc(100vh-140px)] py-8">
          {/* Left Column */}
          <div className="space-y-4 sm:space-y-6 max-w-xl">
            <h2 className="text-blue-600 text-base sm:text-lg md:text-xl font-bold tracking-wide uppercase flex items-center gap-2">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
              Hiring Automation
            </h2>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight">
              RECRUIT <br />
              <span className="inline-flex text-blue-600 select-none">
                {smarterWord.split("").map((letter, index) => (
                  <motion.span
                    key={index}
                    custom={index}
                    variants={letterVariants}
                    animate="animate"
                    className="inline-block"
                  >
                    {letter}
                  </motion.span>
                ))}
              </span>
            </h1>

            {/* Top-aligned paragraph height locker wrapper */}
            <div className="min-h-[140px] sm:min-h-[120px] md:min-h-[85px] block">
              <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium leading-relaxed">
                Streamline your hiring workflow with HireQuest. Automate candidate screening by creating interactive assessments, sending test links directly to applicants&apos; emails, and tracking real-time analytics in a unified HR dashboard. Identify top talent instantly without the manual{" "}
                <br className="sm:hidden" />
                <span className="block sm:inline font-bold text-blue-600 select-none min-h-[1.5em] sm:min-h-0">
                  {displayedText || "\u00A0"}
                </span>
              </p>
            </div>

            <div className="pt-2 sm:pt-4 flex flex-wrap items-center gap-4">
              <Link
                href={ROUTES.DASHBOARD}
                className={buttonVariants({
                  variant: "default",
                  size: "lg",
                  className: "w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold tracking-wide text-xs sm:text-sm px-6 sm:px-8 py-5 sm:py-6 rounded-full shadow-lg hover:shadow-blue-500/20 transition-all hover:scale-105 justify-center",
                })}
              >
                GET STARTED AS HR
              </Link>
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
      </div>

      {/* ── Services Section ── */}
      <section id="services" className="bg-white/80 py-14 sm:py-20 border-t border-blue-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 space-y-8 sm:space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Our Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Comprehensive Hiring Services
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm md:text-base">
              Everything you need to screen, evaluate, and advance candidates in a single unified platform.
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border bg-card p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>

                    <div>
                      <span className="text-[10px] sm:text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
                        {item.tag}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── About Us Section ── */}
      <section id="about" className="py-14 sm:py-20 bg-[#e8f2fe]/60 border-t border-blue-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <div className="rounded-3xl border bg-white p-6 sm:p-8 md:p-12 shadow-sm grid gap-8 lg:grid-cols-2 items-center">
            <div className="space-y-4">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                About HireQuest
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Replacing Resume Noise with Unbiased Cognitive Talent Signals
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                HireQuest is a next-generation hiring automation platform built for modern engineering and recruiter teams. We replace static resume screening with interactive cognitive games, objective technical MCQs, and automated multi-round pipeline workflows.
              </p>
              <div className="space-y-2 pt-2 text-xs sm:text-sm text-slate-700 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                  <span>Automated token invitation links & 3-day expiry management</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                  <span>Real-time candidate leaderboard with percentile ranking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                  <span>Seamless single-action candidate advancement across hiring rounds</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 text-center">
              <div className="rounded-2xl bg-blue-50/70 border border-blue-100 p-4 sm:p-6 space-y-1 sm:space-y-2">
                <p className="text-2xl sm:text-3xl md:text-4xl font-black text-blue-600 tabular-nums">98%</p>
                <p className="text-[10px] sm:text-xs font-semibold text-slate-600">Screening Accuracy</p>
              </div>
              <div className="rounded-2xl bg-blue-50/70 border border-blue-100 p-4 sm:p-6 space-y-1 sm:space-y-2">
                <p className="text-2xl sm:text-3xl md:text-4xl font-black text-blue-600 tabular-nums">5x</p>
                <p className="text-[10px] sm:text-xs font-semibold text-slate-600">Faster Hiring Cycle</p>
              </div>
              <div className="rounded-2xl bg-blue-50/70 border border-blue-100 p-4 sm:p-6 space-y-1 sm:space-y-2">
                <p className="text-2xl sm:text-3xl md:text-4xl font-black text-blue-600 tabular-nums">10k+</p>
                <p className="text-[10px] sm:text-xs font-semibold text-slate-600">Assessments Completed</p>
              </div>
              <div className="rounded-2xl bg-blue-50/70 border border-blue-100 p-4 sm:p-6 space-y-1 sm:space-y-2">
                <p className="text-2xl sm:text-3xl md:text-4xl font-black text-blue-600 tabular-nums">100%</p>
                <p className="text-[10px] sm:text-xs font-semibold text-slate-600">Proctoring Transparency</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section id="faq" className="bg-white/80 py-14 sm:py-20 border-t border-blue-100">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 md:px-8 space-y-8 sm:space-y-10">
          <div className="text-center space-y-3">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Everything you need to know about candidate assessments and pipeline workflows.
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border bg-card overflow-hidden transition-all shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-xs sm:text-sm md:text-base text-slate-900 hover:text-blue-600 gap-3"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`h-4 w-4 sm:h-5 sm:w-5 text-slate-400 flex-shrink-0 transition-transform ${
                        isOpen ? "rotate-180 text-blue-600" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 text-xs sm:text-sm text-slate-600 border-t border-slate-100 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Contact Section ── */}
      <section id="contact" className="py-14 sm:py-20 bg-[#e8f2fe]/70 border-t border-blue-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 space-y-8 sm:space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Get in Touch
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Contact Our HR Support Team
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Have questions about enterprise custom pipelines or onboarding? Reach out to us anytime.
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
            {/* Contact Info Cards */}
            <div className="space-y-3 sm:space-y-4">
              <div className="rounded-2xl border bg-white p-4 sm:p-6 shadow-sm space-y-2 sm:space-y-3 flex items-start gap-3 sm:gap-4">
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex-shrink-0">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Email Us</h4>
                  <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5">support@hirequest.com</p>
                  <p className="text-[11px] sm:text-xs text-slate-600">hr@hirequest.com</p>
                </div>
              </div>

              <div className="rounded-2xl border bg-white p-4 sm:p-6 shadow-sm space-y-2 sm:space-y-3 flex items-start gap-3 sm:gap-4">
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex-shrink-0">
                  <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Live Assistance</h4>
                  <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5">Available Mon-Fri 9:00 AM - 6:00 PM IST</p>
                </div>
              </div>

              <div className="rounded-2xl border bg-white p-4 sm:p-6 shadow-sm space-y-2 sm:space-y-3 flex items-start gap-4">
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex-shrink-0">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Location</h4>
                  <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5">HireQuest Technologies, Tech Park</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2 rounded-3xl border bg-white p-6 sm:p-8 shadow-sm">
              {contactSubmitted ? (
                <div className="flex flex-col items-center justify-center text-center py-10 space-y-3">
                  <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 text-green-600" />
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">Message Sent Successfully!</h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Thank you for reaching out. Our HR support team will get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700">Full Name</label>
                      <Input placeholder="Rohit Solanki" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700">Work Email</label>
                      <Input type="email" placeholder="rohit@company.com" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700">Subject</label>
                    <Input placeholder="Inquiry about HR Pipeline Automation" required />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700">Message</label>
                    <Textarea placeholder="How can we help your team?" className="min-h-[100px] sm:min-h-[120px]" required />
                  </div>

                  <Button type="submit" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-900 text-slate-400 py-10 sm:py-12 border-t border-slate-800 text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">
              H
            </div>
            <span className="text-base font-bold text-white tracking-tight">HireQuest</span>
          </div>

          <p>© {new Date().getFullYear()} HireQuest Technologies. All rights reserved.</p>

          <div className="flex items-center gap-4 sm:gap-6 text-xs">
            <a
              href="#about"
              onClick={(e) => handleScrollTo(e, "about")}
              className="hover:text-white transition-colors"
            >
              About Us
            </a>
            <a
              href="#services"
              onClick={(e) => handleScrollTo(e, "services")}
              className="hover:text-white transition-colors"
            >
              Services
            </a>
            <a
              href="#faq"
              onClick={(e) => handleScrollTo(e, "faq")}
              className="hover:text-white transition-colors"
            >
              FAQ
            </a>
            <a
              href="#contact"
              onClick={(e) => handleScrollTo(e, "contact")}
              className="hover:text-white transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
