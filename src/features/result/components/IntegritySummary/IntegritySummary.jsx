const IntegritySummary = ({ integrity = {} }) => {
  const tabSwitchCount = integrity?.tabSwitchCount ?? 0;
  const windowBlurCount = integrity?.windowBlurCount ?? 0;
  const fullscreenExitCount = integrity?.fullscreenExitCount ?? 0;

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
      <div>
        <h3 className="font-semibold text-slate-900">Session Activity Signals</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Contextual events recorded during candidate assessment execution.
        </p>
      </div>

      <div className="divide-y text-sm">
        <div className="flex justify-between py-2.5">
          <span className="text-muted-foreground">Tab hidden events</span>
          <span className="font-semibold text-slate-900">{tabSwitchCount}</span>
        </div>

        <div className="flex justify-between py-2.5">
          <span className="text-muted-foreground">Window focus losses</span>
          <span className="font-semibold text-slate-900">{windowBlurCount}</span>
        </div>

        <div className="flex justify-between py-2.5">
          <span className="text-muted-foreground">Fullscreen exits</span>
          <span className="font-semibold text-slate-900">{fullscreenExitCount}</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground italic border-t pt-3">
        * Activity signals provide additional context for review and should not be treated as definitive proof of misconduct.
      </p>
    </div>
  );
};

export default IntegritySummary;
