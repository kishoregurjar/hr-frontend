import { AssessmentTimer, SaveStatus } from "@/features/attempt/components";

const AssessmentRuntimeHeader = ({
  title,
  status,
  remainingSeconds,
  isSaving,
  isSaveError,
  lastSavedAt,
  companyName,
  companyLogo,
  brandColor,
}) => {
  let branding = { companyName, companyLogo, brandColor };
  if (!branding.companyName && typeof window !== "undefined") {
    try {
      const stored = sessionStorage.getItem("candidate_company_branding");
      if (stored) {
        const parsed = JSON.parse(stored);
        branding = { ...parsed, ...branding };
      }
    } catch {}
  }

  return (
    <header className="sticky top-0 z-20 border-b bg-background shadow-xs">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:py-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {branding.companyLogo ? (
            <img
              src={branding.companyLogo}
              alt={branding.companyName || "Company"}
              className="h-8 w-8 rounded-xl object-contain bg-white border border-slate-200/80 p-0.5 shrink-0"
            />
          ) : branding.companyName ? (
            <div
              className="h-8 w-8 rounded-xl flex items-center justify-center font-black text-xs text-white shrink-0 shadow-2xs"
              style={{ backgroundColor: branding.brandColor || "#2563eb" }}
            >
              {branding.companyName.charAt(0).toUpperCase()}
            </div>
          ) : null}

          <div className="min-w-0">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground truncate">
              {branding.companyName || "Assessment Runtime"}
            </p>
            <h1 className="mt-0.5 truncate text-base sm:text-lg font-bold text-slate-900">
              {title}
            </h1>
          </div>
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
