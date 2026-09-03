import { getAssignmentByToken } from "@/lib/api/assignments";
import { getCandidateById } from "@/lib/api/candidates";
import { getAssessmentById } from "@/lib/api/assessments";
import { getQuestions } from "@/lib/api/questions";
import { games as staticGames } from "@/features/games/data";

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

    // Ensure questions and games are populated for smooth runtime
    let questions = assessment?.questions || [];
    if (!Array.isArray(questions) || questions.length === 0) {
      const qRes = await getQuestions().catch(() => ({ data: [] }));
      const qList = Array.isArray(qRes?.data) ? qRes.data : Array.isArray(qRes) ? qRes : [];
      questions = qList.length > 0 ? qList : [];
    }

    let games = assessment?.games || [];
    if (!Array.isArray(games) || games.length === 0) {
      games = Array.isArray(staticGames) ? staticGames.slice(0, 2) : [];
    }

    const hydratedAssessment = {
      ...assessment,
      title: assessment?.title || "Full Stack & Cognitive Developer Assessment",
      durationMinutes: assessment?.durationMinutes || assessment?.duration || 60,
      passingScore: assessment?.passingScore || 70,
      questions,
      games,
      totalQuestions: questions.length,
      totalGames: games.length,
      questionCount: questions.length,
      gameCount: games.length,
    };

    const candidateName = candidate?.name || assignment?.candidateName || (assignment?.email ? assignment.email.split("@")[0] : "Rohit Panchal");

    return {
      assignment,
      candidate: {
        id: candidate?.id || assignment?.candidateId,
        name: candidateName,
        email: candidate?.email || assignment?.email || assignment?.candidateEmail || "",
        phone: candidate?.phone || "",
      },
      assessment: hydratedAssessment,
    };
  },
};
