import { CheckCircle2, Loader2, Trophy, Target, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const GameCompleted = ({ section, result, onContinue, isSaving, error }) => {
  if (isSaving) {
    return (
      <div className="rounded-2xl border border-slate-200/90 bg-white p-12 text-center shadow-2xs font-sans">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-4 font-bold text-xs text-slate-700">
          Recording game results securely...
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-8 sm:p-10 text-center shadow-2xs font-sans space-y-6">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600">
        <CheckCircle2 className="h-8 w-8" />
      </div>

      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Module Completed!
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          {section?.title || "Cognitive Challenge"} result has been recorded successfully.
        </p>
      </div>

      {result && (
        <div className="mx-auto grid max-w-sm grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-1 text-center">
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <Trophy className="h-3.5 w-3.5 text-amber-500" />
              <span>Score</span>
            </div>
            <p className="text-2xl font-black text-slate-900">
              {result.score != null ? result.score : 100}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-1 text-center">
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <Target className="h-3.5 w-3.5 text-blue-600" />
              <span>Accuracy</span>
            </div>
            <p className="text-2xl font-black text-slate-900">
              {result.accuracy != null ? `${result.accuracy}%` : "100%"}
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs font-bold text-rose-600">
          {error.message || "Unable to save the game result."}
        </p>
      )}

      <div className="pt-2">
        <Button
          type="button"
          size="lg"
          className="h-11 px-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs gap-2 shadow-md shadow-blue-500/20 cursor-pointer"
          onClick={onContinue}
          disabled={Boolean(error)}
        >
          Continue to Next Module
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default GameCompleted;
