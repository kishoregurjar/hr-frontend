import { getAssignmentByToken } from "@/lib/api/assignments";

export const invitationService = {
  getByToken: async (token) => {
    const assignment = await getAssignmentByToken(token);

    const candidate = assignment?.candidate || {
      id: assignment?.candidateId,
      name: assignment?.candidateName || (assignment?.email ? assignment.email.split("@")[0] : "Candidate"),
      email: assignment?.email || assignment?.candidateEmail || "",
      phone: assignment?.phone || assignment?.candidatePhone || "",
      companyName: assignment?.companyName,
      companyLogo: assignment?.companyLogo,
    };

    const assessment = assignment?.assessment || {
      id: assignment?.assessmentId,
      title: "Candidate Assessment",
      description: "Assessment session for role evaluation.",
      durationMinutes: 60,
      passingScore: 60,
      companyName: assignment?.companyName,
      companyLogo: assignment?.companyLogo,
      questions: [],
      games: [],
    };

    const rawGames =
      assessment?.games ||
      assessment?.selectedGameIds ||
      assessment?.AssessmentGames ||
      assessment?.assessmentGames ||
      [];
    const games = Array.isArray(rawGames) ? rawGames : [];

    const rawQuestions =
      assessment?.questions ||
      assessment?.AssessmentQuestion ||
      assessment?.AssessmentQuestions ||
      assessment?.assessmentQuestions ||
      [];
    const questions = Array.isArray(rawQuestions) ? rawQuestions : [];

    const hydratedAssessment = {
      ...assessment,
      title: assessment?.title || "Candidate Assessment",
      companyName:
        assessment?.companyName ||
        assessment?.company?.name ||
        assessment?.createdBy?.company?.name ||
        assessment?.createdBy?.companyMembers?.[0]?.company?.name ||
        assignment?.companyName ||
        assignment?.candidate?.company?.name ||
        "Company Assessment",
      companyLogo:
        assessment?.companyLogo ||
        assessment?.company?.logoUrl ||
        assessment?.createdBy?.company?.logoUrl ||
        assessment?.createdBy?.companyMembers?.[0]?.company?.logoUrl ||
        assignment?.companyLogo ||
        assignment?.candidate?.company?.logoUrl ||
        null,
      durationMinutes: assessment?.durationMinutes || assessment?.duration || 60,
      passingScore: assessment?.passingScore || 60,
      questions,
      games,
      totalQuestions: questions.length,
      totalGames: games.length,
      questionCount: questions.length,
      gameCount: games.length,
    };

    return {
      assignment,
      candidate,
      assessment: hydratedAssessment,
    };
  },
};
