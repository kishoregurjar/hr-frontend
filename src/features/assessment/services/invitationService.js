import { getAssignmentByToken } from "@/lib/api/assignments";
import { getCandidateById } from "@/lib/api/candidates";
import { getAssessmentById } from "@/lib/api/assessments";
import { getQuestions } from "@/lib/api/questions";

export const invitationService = {
  getByToken: async (token) => {
    const assignment = await getAssignmentByToken(token);

    let candidate = assignment?.candidate || null;
    let assessment = assignment?.assessment || null;

    if (!candidate && assignment?.candidateId) {
      candidate = await getCandidateById(assignment.candidateId).catch(() => null);
    }
    if (!assessment && assignment?.assessmentId) {
      assessment = await getAssessmentById(assignment.assessmentId).catch(() => null);
    }

    const questions = Array.isArray(assessment?.questions) ? assessment.questions : [];
    const games = Array.isArray(assessment?.games)
      ? assessment.games
      : Array.isArray(assessment?.selectedGameIds)
      ? assessment.selectedGameIds
      : Array.isArray(assessment?.AssessmentGames)
      ? assessment.AssessmentGames
      : [];

    const companyName =
      assessment?.companyName ||
      assignment?.companyName ||
      candidate?.companyName ||
      candidate?.company?.name ||
      "";

    const hydratedAssessment = {
      ...assessment,
      title: assessment?.title || "Candidate Assessment",
      durationMinutes: assessment?.durationMinutes || assessment?.duration || 60,
      passingScore: assessment?.passingScore || 70,
      companyName,
      questions,
      games,
      totalQuestions: questions.length,
      totalGames: games.length,
      questionCount: questions.length,
      gameCount: games.length,
    };

    const candidateName = candidate?.name || assignment?.candidateName || (assignment?.email ? assignment.email.split("@")[0] : "Candidate");

    return {
      assignment,
      candidate: {
        id: candidate?.id || assignment?.candidateId,
        name: candidateName,
        email: candidate?.email || assignment?.email || assignment?.candidateEmail || "",
        phone: candidate?.phone || assignment?.phone || "",
        companyName,
      },
      assessment: hydratedAssessment,
    };
  },
};
