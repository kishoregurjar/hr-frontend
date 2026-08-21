"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants";
import hiringHero from "@/assets/illustrations/hiring_hero.png";

export default function HeroSection() {
  const smarterWord = "SMARTER";
  const typewriterText = "sorting hassle.";

  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

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

  return (
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
              className:
                "w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold tracking-wide text-xs sm:text-sm px-6 sm:px-8 py-5 sm:py-6 rounded-full shadow-lg hover:shadow-blue-500/20 transition-all hover:scale-105 justify-center",
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
  );
}
