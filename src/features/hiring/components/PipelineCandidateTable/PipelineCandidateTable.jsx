import { Badge } from "@/components/ui/badge";
import { InvitationActions } from "@/features/assignment/components";
import { getAssignmentPath } from "@/features/assignment/utils";

const PipelineCandidateTable = ({ candidates = [], rounds = [] }) => {
  if (!candidates || candidates.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-10 text-center shadow-sm">
        <h3 className="font-semibold text-foreground">No pipeline candidates</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Candidates added to this hiring process will appear here.
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
              <th className="px-5 py-3.5 text-left">Candidate</th>
              {rounds.map((round) => (
                <th key={round.id} className="px-5 py-3.5 text-left">
                  {round.title}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y text-sm">
            {candidates.map((candidate) => (
              <tr
                key={candidate.id}
                className="transition-colors hover:bg-muted/30"
              >
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-900">
                    {candidate.candidate.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {candidate.candidate.email}
                  </p>
                </td>

                {rounds.map((round) => {
                  const candidateRound = candidate.rounds.find(
                    (item) => item.roundId === round.id
                  );

                  let badgeVariant = "secondary";
                  let customBadgeStyle = "";

                  if (candidateRound?.decision === "Shortlisted") {
                    badgeVariant = "default";
                    customBadgeStyle =
                      "bg-green-100 text-green-800 border-green-200 hover:bg-green-100";
                  } else if (candidateRound?.decision === "Rejected") {
                    badgeVariant = "destructive";
                  }

                  const invitationPath = candidateRound?.assignmentId
                    ? getAssignmentPath(candidateRound.assignmentId)
                    : null;

                  return (
                    <td key={round.id} className="px-5 py-4">
                      {candidateRound ? (
                        <div className="flex flex-col gap-1.5 items-start">
                          <span className="text-xs font-medium text-slate-700">
                            {candidateRound.status}
                          </span>
                          {candidateRound.decision && (
                            <Badge
                              variant={badgeVariant}
                              className={`text-[11px] ${customBadgeStyle}`}
                            >
                              {candidateRound.decision}
                            </Badge>
                          )}
                          {candidateRound.status === "Invited" &&
                            invitationPath && (
                              <div className="mt-1">
                                <InvitationActions link={invitationPath} />
                              </div>
                            )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PipelineCandidateTable;
