"use client";

import { useState } from "react";
import { Clock, FileText, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

const AssessmentPreStart = ({ assessment, isStarting, onStart }) => {
  const [accepted, setAccepted] = useState(false);

  const totalItems =
    assessment?.items?.length ??
    assessment?.questions?.length ??
    assessment?.sections?.length ??
    0;

  const durationMinutes =
    assessment?.durationMinutes ??
    assessment?.timeLimit ??
    assessment?.duration ??
    45;

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8 px-4">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Candidate Assessment
        </span>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          {assessment.title}
        </h1>

        {assessment.description && (
          <p className="mt-2 text-sm text-muted-foreground">
            {assessment.description}
          </p>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Duration</p>
            <p className="mt-0.5 text-lg font-bold text-slate-900">
              {durationMinutes} Minutes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Test Items</p>
            <p className="mt-0.5 text-lg font-bold text-slate-900">
              {totalItems} Questions / Games
            </p>
          </div>
        </div>
      </div>

      {/* Instructions Box */}
      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-slate-900">
            Before you begin
          </h2>
        </div>

        <ul className="list-disc space-y-2.5 pl-5 text-sm text-slate-600">
          <li>
            The timer starts as soon as you click <strong>Start Assessment</strong>.
          </li>
          <li>
            The timer cannot be paused once the assessment has started.
          </li>
          <li>
            Refreshing or closing the browser tab will <strong>not</strong> reset the timer.
          </li>
          <li>
            Your answers and current progress are automatically saved as you navigate.
          </li>
          <li>
            Session activity such as tab visibility and fullscreen exits may be logged for review.
          </li>
          <li>
            Review your answers carefully before submitting your final responses.
          </li>
        </ul>
      </div>

      {/* Acceptance Checkbox */}
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border bg-card p-4 shadow-sm transition-colors hover:bg-muted/30">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(event) => setAccepted(event.target.checked)}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />

        <span className="text-sm font-medium text-slate-800">
          I have read and understood the assessment instructions and guidelines.
        </span>
      </label>

      {/* Action Button */}
      <div className="flex justify-end pt-2">
        <Button
          type="button"
          size="lg"
          disabled={!accepted || isStarting}
          onClick={onStart}
          className="w-full sm:w-auto min-w-[200px]"
        >
          {isStarting ? "Starting..." : "Start Assessment"}
        </Button>
      </div>
    </div>
  );
};

export default AssessmentPreStart;
