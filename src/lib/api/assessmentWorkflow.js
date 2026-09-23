import { getAssessmentById } from "./assessments";
import { getAssignmentByToken, startAssignment, completeAssignment } from "./assignments";
import { startAttempt, completeAttempt } from "./attempts";
import { updateCandidateRoundStatus } from "./hiringPipeline";
import { createAssessmentResult } from "./results";
import { calculateAttemptScore } from "@/lib/scoring/calculateAttemptScore";

export const startAssessmentWorkflow = async (token, candidateInfo = {}) => {
  const assignment = await getAssignmentByToken(token);

  if (assignment.isExpired && assignment.status !== "Completed") {
    throw new Error("Assessment invitation has expired.");
  }

  if (assignment.status === "Completed") {
    throw new Error("Assessment has already been completed.");
  }

  const assessment = assignment.assessment || (await getAssessmentById(assignment.assessmentId).catch(() => null));

  const startedAssignment = await startAssignment(token);

  const attempt = await startAttempt({
    assignmentId: startedAssignment.id,
    candidateId: startedAssignment.candidateId,
    candidateInfo,
    candidateAccessToken: candidateInfo?.candidateAccessToken,
    candidateName: candidateInfo?.name,
    candidatePhone: candidateInfo?.phone,
    assessmentId: startedAssignment.assessmentId || assessment?.id,
    assessment,
    assessmentTitle: assessment?.title,
    questions:
      (assessment?.questions?.length ? assessment.questions : null) ||
      (assessment?.AssessmentQuestion?.length ? assessment.AssessmentQuestion : null) ||
      (assessment?.AssessmentQuestions?.length ? assessment.AssessmentQuestions : null) ||
      (assessment?.assessmentQuestion?.length ? assessment.assessmentQuestion : null) ||
      (assessment?.assessmentQuestions?.length ? assessment.assessmentQuestions : null) ||
      [],
    games: assessment?.selectedGameIds || assessment?.AssessmentGames || assessment?.games || [],
    hiringProcessId: startedAssignment.hiringProcessId,
    roundId: startedAssignment.roundId,
    durationMinutes: assessment?.timeLimit ?? assessment?.durationMinutes ?? assessment?.duration ?? 45,
    token,
  });

  if (startedAssignment.hiringProcessId && startedAssignment.roundId) {
    await updateCandidateRoundStatus({
      hiringProcessId: startedAssignment.hiringProcessId,
      candidateId: startedAssignment.candidateId,
      roundId: startedAssignment.roundId,
      status: "In Progress",
    });
  }

  return {
    assignment: startedAssignment,
    attempt,
  };
};

export const submitAssessmentWorkflow = async ({
  assignment,
  attemptId,
  responses = [],
  assessment,
}) => {
  if (assignment.status === "Completed") {
    throw new Error("Assessment has already been submitted.");
  }

  const completedAttempt = await completeAttempt({
    attemptId,
    assessment,
    responses,
  });

  const score = calculateAttemptScore(completedAttempt.responses);

  const result = await createAssessmentResult({
    attempt: completedAttempt,
    assignment,
    score,
  });

  const completedAssignment = await completeAssignment({
    assignmentId: assignment.id,
  });

  if (assignment.hiringProcessId && assignment.roundId) {
    await updateCandidateRoundStatus({
      hiringProcessId: assignment.hiringProcessId,
      candidateId: assignment.candidateId,
      roundId: assignment.roundId,
      status: "Completed",
      resultId: result.id,
    });
  }

  return {
    assignment: completedAssignment,
    attempt: completedAttempt,
    result,
  };
};
