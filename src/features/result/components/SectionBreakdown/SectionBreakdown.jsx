import { Gamepad2, HelpCircle } from "lucide-react";

const SectionBreakdown = ({ sections = [] }) => {
  if (!sections || sections.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center shadow-sm">
        <p className="text-sm text-muted-foreground">
          Section breakdown is unavailable.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      {sections.map((section) => {
        const Icon = section.type === "quiz" ? HelpCircle : Gamepad2;

        return (
          <div
            key={section.id}
            className="flex flex-col gap-4 border-b p-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 rounded-lg border bg-muted p-3">
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.type}
                </p>

                <h3 className="mt-0.5 font-semibold text-slate-900">
                  {section.title}
                </h3>

                {section.type === "quiz" && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {section.correctAnswers} / {section.totalQuestions} correct
                  </p>
                )}

                {section.type === "game" && (
                  <div className="mt-1 text-sm text-muted-foreground">
                    {section.gameScore != null && (
                      <span>Game score: {section.gameScore}</span>
                    )}
                    {section.accuracy != null && (
                      <span> · Accuracy: {section.accuracy}%</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="pl-14 sm:pl-0 sm:text-right">
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {section.score != null ? `${section.score}%` : "—"}
              </p>
              <p className="text-xs text-muted-foreground">Section score</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SectionBreakdown;
