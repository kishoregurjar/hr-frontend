"use client";

import { FileClock, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const AssessmentDraftRecovery = ({ draft, onRestore, onDiscard }) => {
  if (!draft) {
    return null;
  }

  const savedAt = draft.savedAt
    ? new Date(draft.savedAt).toLocaleString()
    : null;

  return (
    <div className="rounded-3xl border border-white/90 bg-white/95 backdrop-blur-md p-6 sm:p-8 shadow-[0_12px_30px_rgba(79,70,229,0.08),0_2px_8px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/5 font-sans space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="h-10 w-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
          <FileClock className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">
            Unsaved Assessment Found
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            We discovered an in-progress assessment draft from your previous session.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 space-y-1">
        {draft.assessment?.title ? (
          <p className="text-sm font-extrabold text-slate-900">
            {draft.assessment.title}
          </p>
        ) : (
          <p className="text-sm font-bold text-slate-700 italic">Untitled Draft</p>
        )}

        {savedAt && (
          <p className="text-xs text-slate-500 font-medium">
            Last automatically saved on: <span className="font-bold text-slate-700">{savedAt}</span>
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button
          type="button"
          onClick={onRestore}
          className="h-10 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 shadow-sm shadow-indigo-500/20 cursor-pointer"
        >
          <span>Continue Assessment</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onDiscard}
          className="h-10 px-4 rounded-xl border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-700 font-bold text-xs gap-1.5 cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Discard & Start Fresh</span>
        </Button>
      </div>
    </div>
  );
};

export default AssessmentDraftRecovery;
