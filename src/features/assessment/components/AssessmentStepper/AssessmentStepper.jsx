import { Check } from "lucide-react";

import { ASSESSMENT_STEPS } from "../../constants";

const AssessmentStepper = ({ currentStep }) => {
  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-[460px] sm:min-w-[650px] items-center">
        {ASSESSMENT_STEPS.map((step, index) => {
          const isCompleted =
            step.id < currentStep;

          const isCurrent =
            step.id === currentStep;

          return (
            <div
              key={step.key}
              className="flex flex-1 items-center"
            >
              <div className="flex flex-col items-center gap-2">
                <div
                  className={[
                    "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-medium",
                    isCompleted || isCurrent
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground",
                  ].join(" ")}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    step.id
                  )}
                </div>

                <span
                  className={[
                    "hidden sm:block text-sm",
                    isCurrent
                      ? "font-medium"
                      : "text-muted-foreground",
                  ].join(" ")}
                >
                  {step.label}
                </span>
              </div>

              {index <
                ASSESSMENT_STEPS.length - 1 && (
                <div
                  className={`mx-3 h-px flex-1 ${
                    isCompleted
                      ? "bg-primary"
                      : "bg-border"
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
