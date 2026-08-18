"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const NextRoundAction = ({
  currentRound,
  nextRound,
  candidateCount,
  onMove,
  isMoving = false,
}) => {
  if (!currentRound || !nextRound || candidateCount === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm border-primary/20 bg-primary/5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Next Recruitment Round
          </p>
          <h3 className="mt-1 text-lg font-bold text-slate-900">
            {nextRound.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-semibold text-slate-900">{candidateCount}</span>{" "}
            {candidateCount === 1 ? "candidate is" : "candidates are"}{" "}
            shortlisted and eligible to move forward from{" "}
            <span className="font-medium text-slate-800">{currentRound.title}</span>.
          </p>
        </div>

        <Button type="button" disabled={isMoving} onClick={onMove}>
          Move to Next Round
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default NextRoundAction;
