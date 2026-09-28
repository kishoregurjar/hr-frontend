import { CheckCircle2, Loader2, Trophy, Target, ArrowRight, Gamepad2, Sparkles, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";

const GameCompleted = ({
  section,
  currentGame,
  gameIndex = 0,
  totalGames = 1,
  nextGame = null,
  isLastGame = true,
  result,
  onContinue,
  onNextGame,
  isSaving,
  error,
}) => {
  const isSkipped = Boolean(result?.skipped || result?.status === "SKIPPED");
  const gameTitle = currentGame?.title || section?.title || "Cognitive Challenge";

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-8 sm:p-10 text-center shadow-2xs font-sans space-y-6">
      <div
        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border ${
          isSkipped
            ? "bg-amber-50 border-amber-200 text-amber-600"
            : "bg-emerald-50 border-emerald-200 text-emerald-600"
        }`}
      >
        {isSkipped ? (
          <SkipForward className="h-8 w-8" />
        ) : (
          <CheckCircle2 className="h-8 w-8" />
        )}
      </div>

      <div className="space-y-1.5">
        <div
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-[11px] font-bold ${
            isSkipped
              ? "bg-amber-50 border-amber-200/80 text-amber-700"
              : "bg-emerald-50 border-emerald-200/80 text-emerald-700"
          }`}
        >
          {isSkipped ? (
            <>
              <SkipForward className="h-3 w-3 text-amber-600" />
              Round Skipped (0 pts)
            </>
          ) : (
            <>
              <Sparkles className="h-3 w-3 text-emerald-600" />
              {totalGames > 1
                ? `Game ${gameIndex + 1} of ${totalGames} Completed`
                : "Challenge Completed"}
            </>
          )}
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {isSkipped
            ? `${gameTitle} Skipped`
            : isLastGame && totalGames > 1
            ? "Cognitive Games Module Completed!"
            : `${gameTitle} Completed!`}
        </h2>
        <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
          {isSkipped
            ? "This game round was skipped. 0 points recorded for this challenge."
            : isLastGame && totalGames > 1
            ? `All ${totalGames} cognitive challenges finished. Your performance data has been synchronized.`
            : `Performance data for ${gameTitle} has been recorded successfully.`}
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
        {!isLastGame && nextGame ? (
          <Button
            type="button"
            size="lg"
            className="h-11 px-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs gap-2 shadow-md shadow-blue-500/20 cursor-pointer"
            onClick={onNextGame}
            disabled={Boolean(error)}
          >
            <Gamepad2 className="h-4 w-4" />
            Next Game Challenge: {nextGame.title}
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default GameCompleted;
