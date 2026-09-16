import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Gamepad2, FileText } from "lucide-react";

const AssessmentProgress = ({ current, total, sections = [], currentIndex = 0, onSelectSection, attempt }) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Overall Progress Header */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <span>Assessment Progress</span>
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            {current} of {total} Modules
          </span>
        </div>
        <span className="tabular-nums text-sm font-bold text-muted-foreground">
          {Math.round(percentage)}% Complete
        </span>
      </div>

      <Progress value={percentage} className="h-2.5 rounded-full" />

      {/* Interactive Section / Game Tabs Bar */}
      {sections.length > 1 && (
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {sections.map((sec, idx) => {
            const isActive = idx === currentIndex;
            const isCompleted = Boolean(attempt?.gameResults?.[sec.id] || attempt?.sectionResults?.[sec.id]);
            const isGame = sec.type === "game";

            return (
              <button
                key={sec.id || idx}
                type="button"
                onClick={() => onSelectSection?.(idx)}
                className={`group flex flex-shrink-0 items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium transition-all ${
                  isActive
                    ? "border-blue-600 bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/30"
                    : isCompleted
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-300 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300"
                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className={`h-3.5 w-3.5 ${isActive ? "text-white" : "text-emerald-600 dark:text-emerald-400"}`} />
                ) : isGame ? (
                  <Gamepad2 className={`h-3.5 w-3.5 ${isActive ? "text-white" : "text-blue-600 dark:text-blue-400"}`} />
                ) : (
                  <FileText className={`h-3.5 w-3.5 ${isActive ? "text-white" : "text-slate-500"}`} />
                )}

                <span className="max-w-[160px] truncate font-semibold">
                  {sec.title || `Section ${idx + 1}`}
                </span>

                <span
                  className={`ml-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : isCompleted
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {idx + 1}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AssessmentProgress;
