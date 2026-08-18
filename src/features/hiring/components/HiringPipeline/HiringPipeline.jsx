import { Check } from "lucide-react";

const HiringPipeline = ({ rounds = [] }) => {
  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max items-center py-2">
        {rounds.map((round, index) => {
          const completed = round.status === "Completed";
          const active = round.status === "Active";

          return (
            <div key={round.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition-colors ${
                    completed
                      ? "bg-primary text-primary-foreground border-primary"
                      : active
                      ? "border-primary text-primary bg-primary/10 ring-4 ring-primary/20"
                      : "bg-muted text-muted-foreground border-input"
                  }`}
                >
                  {completed ? <Check className="h-5 w-5" /> : round.order}
                </div>

                <div className="mt-3 w-36 text-center">
                  <p className="text-sm font-semibold text-slate-900 leading-tight">
                    {round.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground capitalize">
                    {round.status}
                  </p>
                </div>
              </div>

              {index < rounds.length - 1 && (
                <div className="mx-4 mb-10 h-0.5 w-20 bg-border" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HiringPipeline;
