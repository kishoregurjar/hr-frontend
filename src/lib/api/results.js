const results = [
  {
    id: "result-1",
    assessmentId: "ass-001",
    attemptId: "attempt-1",
    candidateId: "cand-1",
    candidate: {
      id: "cand-1",
      name: "Rahul Sharma",
      email: "rahul@example.com",
    },
    assessment: {
      id: "ass-001",
      title: "Frontend Developer Assessment",
    },
    status: "Completed",
    score: 82.2,
    quizScore: 78,
    gameScore: 86,
    decision: "Pending",
    decisionAt: null,
    startedAt: "2026-07-28T10:00:00.000Z",
    submittedAt: "2026-07-28T10:42:00.000Z",
    sections: [
      {
        id: "quiz-js",
        type: "quiz",
        title: "JavaScript Quiz",
        score: 80,
        correctAnswers: 8,
        totalQuestions: 10,
      },
      {
        id: "memory-game",
        type: "game",
        title: "Pattern Memory",
        score: 86,
        gameScore: 420,
        accuracy: 86,
      },
      {
        id: "quiz-react",
        type: "quiz",
        title: "React & Web Core Quiz",
        score: 76,
        correctAnswers: 7,
        totalQuestions: 9,
      },
    ],
  },
  {
    id: "result-2",
    assessmentId: "ass-001",
    attemptId: "attempt-2",
    candidateId: "cand-2",
    candidate: {
      id: "cand-2",
      name: "Priya Patel",
      email: "priya@example.com",
    },
    assessment: {
      id: "ass-001",
      title: "Frontend Developer Assessment",
    },
    status: "Completed",
    score: 94.5,
    quizScore: 94,
    gameScore: 95,
    decision: "Shortlisted",
    decisionAt: "2026-07-29T08:30:00.000Z",
    startedAt: "2026-07-28T11:00:00.000Z",
    submittedAt: "2026-07-28T11:38:00.000Z",
    sections: [
      {
        id: "quiz-js",
        type: "quiz",
        title: "JavaScript Quiz",
        score: 94,
        correctAnswers: 9,
        totalQuestions: 10,
      },
      {
        id: "memory-game",
        type: "game",
        title: "Pattern Memory",
        score: 95,
        gameScore: 490,
        accuracy: 95,
      },
      {
        id: "quiz-react",
        type: "quiz",
        title: "React & Web Core Quiz",
        score: 94,
        correctAnswers: 9,
        totalQuestions: 10,
      },
    ],
  },
  {
    id: "result-3",
    assessmentId: "ass-001",
    attemptId: "attempt-3",
    candidateId: "cand-3",
    candidate: {
      id: "cand-3",
      name: "Aman Verma",
      email: "aman@example.com",
    },
    assessment: {
      id: "ass-001",
      title: "Frontend Developer Assessment",
    },
    status: "Completed",
    score: 79.8,
    quizScore: 75,
    gameScore: 83,
    decision: "Pending",
    decisionAt: null,
    startedAt: "2026-07-28T12:00:00.000Z",
    submittedAt: "2026-07-28T12:45:00.000Z",
    sections: [
      {
        id: "quiz-js",
        type: "quiz",
        title: "JavaScript Quiz",
        score: 75,
        correctAnswers: 7,
        totalQuestions: 10,
      },
      {
        id: "memory-game",
        type: "game",
        title: "Pattern Memory",
        score: 83,
        gameScore: 410,
        accuracy: 83,
      },
    ],
  },
  {
    id: "result-4",
    assessmentId: "ass-001",
    attemptId: "attempt-4",
    candidateId: "cand-4",
    candidate: {
      id: "cand-4",
      name: "Neha Singh",
      email: "neha@example.com",
    },
    assessment: {
      id: "ass-001",
      title: "Frontend Developer Assessment",
    },
    status: "Completed",
    score: 61.4,
    quizScore: 60,
    gameScore: 62,
    decision: "Rejected",
    decisionAt: "2026-07-29T09:15:00.000Z",
    startedAt: "2026-07-28T14:00:00.000Z",
    submittedAt: "2026-07-28T14:50:00.000Z",
    sections: [
      {
        id: "quiz-js",
        type: "quiz",
        title: "JavaScript Quiz",
        score: 60,
        correctAnswers: 6,
        totalQuestions: 10,
      },
      {
        id: "memory-game",
        type: "game",
        title: "Pattern Memory",
        score: 62,
        gameScore: 300,
        accuracy: 62,
      },
    ],
  },
];

const delay = (ms = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const getAssessmentResults = async (assessmentId) => {
  await delay(500);

  const matched = results.filter(
    (result) => String(result.assessmentId) === String(assessmentId)
  );

  return matched.length > 0 ? matched : results;
};

export const getAssessmentResultSummary = async (assessmentId) => {
  await delay(400);

  const assessmentResults = await getAssessmentResults(assessmentId);

  const candidates = assessmentResults.length;
  const inProgress = assessmentResults.filter(
    (result) => result.status === "In Progress"
  ).length;
  const completed = assessmentResults.filter(
    (result) => result.status === "Completed"
  ).length;
  const shortlisted = assessmentResults.filter(
    (result) => result.decision === "Shortlisted"
  ).length;

  return {
    candidates,
    invited: candidates,
    started: inProgress + completed,
    completed,
    shortlisted,
  };
};

export const getResultById = async ({ assessmentId, resultId }) => {
  await delay(500);

  const result = results.find(
    (item) =>
      String(item.id) === String(resultId) &&
      (assessmentId ? String(item.assessmentId) === String(assessmentId) : true)
  );

  if (!result) {
    throw new Error("Candidate result not found.");
  }

  if (result.status !== "Completed") {
    throw new Error("Candidate result is not available yet.");
  }

  return { ...result };
};

export const createAssessmentResult = async ({ attempt, assignment, score }) => {
  await delay(300);

  const existing = results.find(
    (result) => String(result.attemptId) === String(attempt.id)
  );

  if (existing) {
    return { ...existing };
  }

  const result = {
    id: crypto.randomUUID(),
    attemptId: attempt.id,
    assignmentId: assignment.id,
    candidateId: assignment.candidateId,
    assessmentId: assignment.assessmentId,
    hiringProcessId: assignment.hiringProcessId,
    roundId: assignment.roundId,
    candidate: {
      id: assignment.candidateId,
      name: "Candidate",
      email: "candidate@example.com",
    },
    assessment: {
      id: assignment.assessmentId,
      title: "Assessment",
    },
    status: "Completed",
    score: score?.score ?? score?.percentage ?? score ?? 0,
    quizScore: score?.quizScore ?? 80,
    gameScore: score?.gameScore ?? 85,
    decision: "Pending",
    decisionAt: null,
    startedAt: attempt.startedAt,
    submittedAt: attempt.submittedAt || new Date().toISOString(),
    sections: attempt.sectionScores ?? [],
    integrity: {
      tabSwitchCount: attempt?.integrity?.tabSwitchCount ?? 0,
      windowBlurCount: attempt?.integrity?.windowBlurCount ?? 0,
      fullscreenExitCount: attempt?.integrity?.fullscreenExitCount ?? 0,
    },
  };

  results.push(result);
  return { ...result };
};

export const updateCandidateDecision = async ({ resultId, decision }) => {
  await delay(400);

  const allowedDecisions = ["Pending", "Shortlisted", "Rejected"];

  if (!allowedDecisions.includes(decision)) {
    throw new Error("Invalid candidate decision.");
  }

  const index = results.findIndex(
    (result) => String(result.id) === String(resultId)
  );

  if (index === -1) {
    throw new Error("Candidate result not found.");
  }

  if (results[index].status !== "Completed") {
    throw new Error("Only completed candidates can be reviewed.");
  }

  results[index] = {
    ...results[index],
    decision,
    decisionAt: decision === "Pending" ? null : new Date().toISOString(),
  };

  return { ...results[index] };
};

export const updateCandidateDecisions = async ({ resultIds, decision }) => {
  await delay(600);

  const allowedDecisions = ["Pending", "Shortlisted", "Rejected"];

  if (!allowedDecisions.includes(decision)) {
    throw new Error("Invalid candidate decision.");
  }

  if (!Array.isArray(resultIds) || resultIds.length === 0) {
    throw new Error("Select at least one candidate.");
  }

  const uniqueIds = [...new Set(resultIds.map(String))];

  const selectedResults = uniqueIds.map((id) =>
    results.find((result) => String(result.id) === id)
  );

  if (selectedResults.some((result) => !result)) {
    throw new Error("One or more candidate results were not found.");
  }

  if (selectedResults.some((result) => result.status !== "Completed")) {
    throw new Error("Only completed candidates can be reviewed.");
  }

  const now = new Date().toISOString();

  const updatedResults = selectedResults.map((result) => {
    const index = results.findIndex(
      (item) => String(item.id) === String(result.id)
    );

    results[index] = {
      ...results[index],
      decision,
      decisionAt: decision === "Pending" ? null : now,
    };

    return { ...results[index] };
  });

  return updatedResults;
};
