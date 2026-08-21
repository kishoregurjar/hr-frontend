import { CheckCircle2 } from "lucide-react";

export default function AboutSection() {
  return (
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
  );
}
