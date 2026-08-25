"use client";

import { Check } from "lucide-react";
import { ASSESSMENT_STEPS } from "../../constants";

const AssessmentStepper = ({ currentStep }) => {
  return (
    <div className="overflow-x-auto py-2">
      <div className="flex min-w-[460px] sm:min-w-[650px] items-center">
        {ASSESSMENT_STEPS.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;

          return (
            <div key={step.key} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-black transition-all ${
                    isCompleted
                      ? "bg-emerald-600 text-white shadow-sm"
                      : isCurrent
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-4 ring-blue-100"
                      : "bg-slate-100 text-slate-400 border border-slate-200"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4 stroke-[3]" />
                  ) : (
                    step.id
                  )}
                </div>

                <span
                  className={`text-xs font-bold transition-colors ${
                    isCurrent
                      ? "text-blue-600"
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
                  className={`mx-3 h-0.5 flex-1 transition-colors ${
                    isCompleted ? "bg-emerald-600" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AssessmentStepper;
