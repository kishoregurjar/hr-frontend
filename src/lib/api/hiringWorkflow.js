import { createAssignments } from "./assignments";
import {
  attachAssignmentToCandidateRound,
  moveCandidatesToRound,
} from "./hiringPipeline";
import { activateNextRound } from "./hiringProcesses";

export const advanceHiringRound = async ({
  hiringProcessId,
  currentRoundId,
  nextRound,
  candidateIds,
}) => {
  const nextRoundId = nextRound.id || nextRound;

  const updatedCandidates = await moveCandidatesToRound({
    hiringProcessId,
    candidateIds,
    targetRoundId: nextRoundId,
  });

  const updatedProcess = await activateNextRound({
    hiringProcessId,
    currentRoundId,
    nextRoundId,
  });

  let createdAssignments = [];

  if (nextRound?.type === "assessment") {
    if (!nextRound.assessmentId) {
      throw new Error("Assessment round does not have an assigned assessment.");
    }

    createdAssignments = await createAssignments({
      candidates: updatedCandidates,
      assessmentId: nextRound.assessmentId,
      hiringProcessId,
      roundId: nextRoundId,
    });

    for (const assignment of createdAssignments) {
      await attachAssignmentToCandidateRound({
        hiringProcessId,
        candidateId: assignment.candidateId,
        roundId: nextRoundId,
        assignmentId: assignment.id,
      });
    }
  }

  return {
    process: updatedProcess,
    candidates: updatedCandidates,
    assignments: createdAssignments,
  };
};
