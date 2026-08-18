import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const GameCompleted = ({ result, onContinue, isSaving, error }) => {
  if (isSaving) {
    return (
      <div className="rounded-xl border bg-card p-12 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 font-medium text-muted-foreground">
          Saving game result...
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
        <CheckCircle2 className="h-8 w-8 text-green-600" />
      </div>

      <h2 className="mt-4 text-2xl font-semibold">Game Completed</h2>
      <p className="mt-2 text-muted-foreground">
        Your game result has been recorded.
      </p>

      {result && (
        <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-4">
          {result.score != null && (
            <div className="rounded-lg border p-4 bg-muted/30">
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="mt-1 text-2xl font-bold">{result.score}</p>
            </div>
          )}

          {result.accuracy != null && (
            <div className="rounded-lg border p-4 bg-muted/30">
              <p className="text-sm text-muted-foreground">Accuracy</p>
              <p className="mt-1 text-2xl font-bold">{result.accuracy}%</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mt-4 text-sm text-destructive font-medium">
          {error.message || "Unable to save the game result."}
        </p>
      )}

      <Button
        type="button"
        className="mt-8 min-w-[180px]"
        onClick={onContinue}
        disabled={Boolean(error)}
      >
        Continue Assessment
      </Button>
    </div>
  );
};

export default GameCompleted;
