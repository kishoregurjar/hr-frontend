import { Brain, Gamepad2, ShieldAlert, Zap } from "lucide-react";
import TiltGlowCard from "./TiltGlowCard";

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

export default function ServicesSection() {
  return (
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
              <TiltGlowCard
                key={idx}
                className="min-h-[310px]"
              >
                <div className="space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
                    <Icon className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                  </div>

                  <div>
                    <span className="text-[10px] sm:text-[11px] font-semibold text-blue-600 uppercase tracking-wider group-hover:text-blue-700 transition-colors">
                      {item.tag}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1.5 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed font-light">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* TechTantra Style Learn More + Expanding Dash */}
                <div className="pt-5 border-t border-slate-100 flex items-center justify-between mt-4">
                  <span className="text-xs font-semibold text-slate-400 group-hover:text-blue-600 transition-colors">
                    Learn More
                  </span>
                  <span className="w-6 h-0.5 bg-slate-200 group-hover:w-10 group-hover:bg-blue-600 transition-all duration-300 rounded-full" />
                </div>
              </TiltGlowCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
