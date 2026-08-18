import { CheckCircle2, Clock3, Mail, UserCheck, Users } from "lucide-react";

const ResultSummary = ({ summary }) => {
  if (!summary) return null;

  const items = [
    {
      label: "Candidates",
      value: summary.candidates,
      icon: Users,
    },
    {
      label: "Invited",
      value: summary.invited,
      icon: Mail,
    },
    {
      label: "Started",
      value: summary.started,
      icon: Clock3,
    },
    {
      label: "Completed",
      value: summary.completed,
      icon: CheckCircle2,
    },
    {
      label: "Shortlisted",
      value: summary.shortlisted ?? 0,
      icon: UserCheck,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {items.map(({ label, value, icon: Icon }) => (
        <div key={label} className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">
            {value}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ResultSummary;
