"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import DecisionBadge from "../DecisionBadge";
import ResultStatusBadge from "../ResultStatusBadge";

const ResultsTable = ({
  results,
  onViewResult,
  selectedResultIds = [],
  onToggleSelection,
  onToggleAll,
  areAllSelected = false,
}) => {
  if (!results || results.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-10 text-center shadow-sm">
        <h3 className="font-semibold text-foreground">No candidate results</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Candidate results will appear here after assessments are assigned and completed.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <tr>
              {onToggleAll && (
                <th className="w-12 px-5 py-3.5">
                  <Checkbox
                    checked={areAllSelected}
                    onCheckedChange={onToggleAll}
                    aria-label="Select all visible completed candidates"
                  />
                </th>
              )}
              <th className="px-5 py-3.5 text-left w-16">Rank</th>
              <th className="px-5 py-3.5 text-left">Candidate</th>
              <th className="px-5 py-3.5 text-left">Status</th>
              <th className="px-5 py-3.5 text-left">Score</th>
              <th className="px-5 py-3.5 text-left">Decision</th>
              <th className="px-5 py-3.5 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y text-sm">
            {results.map((result) => {
              const isSelected = selectedResultIds.includes(result.id);
              const isCompleted = result.status === "Completed";

              return (
                <tr
                  key={result.id}
                  className={`transition-colors ${
                    isSelected ? "bg-primary/5" : "hover:bg-muted/30"
                  }`}
                >
                  {onToggleSelection && (
                    <td className="px-5 py-4">
                      <Checkbox
                        checked={isSelected}
                        disabled={!isCompleted}
                        onCheckedChange={() => onToggleSelection(result.id)}
                        aria-label={`Select ${result.candidate.name}`}
                      />
                    </td>
                  )}

                  <td className="px-5 py-4 font-bold text-slate-700">
                    {result.rank ? `#${result.rank}` : "—"}
                  </td>

                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">
                      {result.candidate.name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {result.candidate.email}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <ResultStatusBadge status={result.status} />
                  </td>

                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {result.score != null ? `${result.score}%` : "—"}
                  </td>

                  <td className="px-5 py-4">
                    {isCompleted ? (
                      <DecisionBadge decision={result.decision ?? "Pending"} />
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>

                  <td className="px-5 py-4 text-right">
                    {isCompleted ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onViewResult(result)}
                      >
                        View Result
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable;
