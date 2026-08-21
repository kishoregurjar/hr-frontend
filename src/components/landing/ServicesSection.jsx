import { Brain, Gamepad2, ShieldAlert, Zap } from "lucide-react";

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
  );
}
