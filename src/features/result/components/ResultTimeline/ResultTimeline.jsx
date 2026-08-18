import { getAssessmentDuration } from "../../utils";

const formatDate = (value) => {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const ResultTimeline = ({ result }) => {
  if (!result) return null;

  const duration = getAssessmentDuration({
    startedAt: result.startedAt,
    submittedAt: result.submittedAt,
  });

  const items = [
    {
      label: "Started",
      value: formatDate(result.startedAt),
    },
    {
      label: "Submitted",
      value: formatDate(result.submittedAt),
    },
    {
      label: "Duration",
      value: duration ?? "—",
    },
  ];

  return (
    <div className="grid gap-4 rounded-xl border bg-card p-5 shadow-sm sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label}>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {item.label}
          </p>
          <p className="mt-1 font-medium text-slate-900">{item.value}</p>
        </div>
      ))}
    </div>
  );
};

export default ResultTimeline;
