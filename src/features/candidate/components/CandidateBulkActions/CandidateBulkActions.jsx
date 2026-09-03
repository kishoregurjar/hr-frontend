"use client";

import { ClipboardList, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const CandidateBulkActions = ({
  selectedCount = 0,
  onClear,
  onAssignAssessment,
  onClearSelection,
}) => {
  if (selectedCount === 0) {
    return null;
  }

  const handleClear = onClear || onClearSelection;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 bg-slate-900/95 text-white border border-slate-700/80 shadow-2xl backdrop-blur-md px-5 py-3 rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-200 font-sans">
      <div className="flex items-center gap-2.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-black shadow-sm">
          {selectedCount}
        </span>
        <div className="text-xs">
          <p className="font-bold text-slate-100">
            {selectedCount === 1 ? "1 Candidate" : `${selectedCount} Candidates`} Selected
          </p>
        </div>
      </div>

      <div className="h-4 w-px bg-slate-700 mx-1" />

      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          onClick={onAssignAssessment}
          className="h-8 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold gap-1.5 shadow-sm shadow-blue-500/30 cursor-pointer"
        >
          <ClipboardList className="h-3.5 w-3.5" />
          Assign Assessment
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="h-8 px-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold gap-1 cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </Button>
      </div>
    </div>
  );
};

export default CandidateBulkActions;
