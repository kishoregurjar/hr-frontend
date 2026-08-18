import { AssessmentTimer, SaveStatus } from "@/features/attempt/components";

const AssessmentRuntimeHeader = ({
  title,
  status,
  remainingSeconds,
  isSaving,
  isSaveError,
  lastSavedAt,
}) => {
  return (
    <header className="sticky top-0 z-20 border-b bg-background shadow-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:py-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Assessment Runtime
          </p>
          <h1 className="mt-0.5 truncate text-lg font-bold text-slate-900 sm:text-xl">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <SaveStatus
            isSaving={isSaving}
            isError={isSaveError}
            lastSavedAt={lastSavedAt}
          />

          {remainingSeconds != null && (
            <AssessmentTimer remainingSeconds={remainingSeconds} />
          )}

          {status && (
            <div className="hidden sm:inline-flex rounded-full border bg-muted px-3 py-1 text-xs font-semibold text-slate-700">
              {status}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AssessmentRuntimeHeader;
