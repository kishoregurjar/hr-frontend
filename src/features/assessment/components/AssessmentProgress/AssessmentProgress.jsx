import { Progress } from "@/components/ui/progress";
import { Gamepad2, FileText, CheckCircle2 } from "lucide-react";

const AssessmentProgress = ({ current, total, sections = [], currentIndex = 0 }) => {
  const percentage = total > 0 ? ((current) / total) * 100 : 0;
  const activeSection = sections[currentIndex] || {};
  const isGame = activeSection.type === "game";

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xs font-sans space-y-3.5">
      {/* ── Top Row: Step Title & Percentage ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60 font-black text-xs">
            {isGame ? <Gamepad2 className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Current Active Section
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
              Module {current} of {total}: <span className="text-blue-600">{activeSection.title || "Evaluation Module"}</span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 px-2.5 py-0.5 text-xs font-black tabular-nums">
            {Math.round(percentage)}% Completed
          </span>
        </div>
      </div>

      {/* ── Sleek Progress Bar ── */}
      <div className="space-y-1.5">
        <Progress value={percentage} className="h-2 rounded-full bg-slate-100" />
        
        {/* Step dots */}
        <div className="flex justify-between items-center px-1 text-[10px] font-bold text-slate-400">
          <span>Start</span>
          <span>Module {current} of {total}</span>
          <span>Final Review & Submit</span>
        </div>
      </div>
    </div>
  );
};

export default AssessmentProgress;
