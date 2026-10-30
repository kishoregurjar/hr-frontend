"use client";

import { Check } from "lucide-react";
import { ASSESSMENT_STEPS } from "../../constants";

const AssessmentStepper = ({ currentStep }) => {
  return (
    <div className="rounded-3xl border border-white/90 bg-white/95 backdrop-blur-md p-4 sm:p-6 shadow-[0_12px_30px_rgba(79,70,229,0.08),0_2px_8px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/5 select-none font-sans">
      <div className="overflow-x-auto no-scrollbar py-1">
        <div className="flex min-w-[340px] sm:min-w-[650px] items-center">
          {ASSESSMENT_STEPS.map((step, index) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;

            return (
              <div key={step.key} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                  <div
                    className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full text-[11px] sm:text-xs font-black transition-all ${
                      isCompleted
                        ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/25"
                        : isCurrent
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25 ring-2 sm:ring-4 ring-indigo-100"
                        : "bg-slate-100 text-slate-400 border border-slate-200/80"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4 stroke-[3]" />
                    ) : (
                      step.id
                    )}
                  </div>

                  <span
                    className={`text-[10px] sm:text-xs font-bold transition-colors text-center leading-tight whitespace-nowrap ${
                      isCurrent
                        ? "text-indigo-600 font-extrabold"
                        : isCompleted
                        ? "text-slate-800"
                        : "text-slate-400 font-medium"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {index < ASSESSMENT_STEPS.length - 1 && (
                  <div
                    className={`mx-2 sm:mx-4 h-0.5 flex-1 transition-colors ${
                      isCompleted ? "bg-emerald-500" : "bg-slate-200/80"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AssessmentStepper;
