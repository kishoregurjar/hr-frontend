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

export const getAllResults = async () => {
  try {
    const res = await axiosClient.get("/results", {
      params: { _t: Date.now() },
    });
    const list = res?.data?.data || res?.data || res;
    if (Array.isArray(list)) {
      return list;
    }
  } catch (err) {
    console.warn("Live results API error:", err.message);
  }
  return [];
};

export const getAssessmentResults = async (assessmentId, params = {}) => {
  try {
    const res = await axiosClient.get("/results", {
      params: { assessmentId, ...params, _t: Date.now() },
    });
    const dataList = res?.data?.data || res?.data || res;
    if (Array.isArray(dataList)) {
      return dataList;
    }
  } catch (err) {
    console.warn("Live assessment results API fallback:", err.message);
  }

  await delay(500);

  const matched = results.filter(
    (result) => String(result.assessmentId) === String(assessmentId)
  );

  return matched.length > 0 ? matched : results;
};

export const getAssessmentResultSummary = async (assessmentId) => {
  try {
    const res = await axiosClient.get(
      `/attempts/assessments/${assessmentId}/analytics`
    );
    const analytics = res?.data?.data || res?.data;
    if (analytics && analytics.attempts) {
      return {
        candidates: analytics.attempts.total ?? 0,
        invited: analytics.attempts.total ?? 0,
        started: analytics.attempts.total ?? 0,
        completed: analytics.attempts.submitted ?? 0,
        inProgress: analytics.attempts.inProgress ?? 0,
        shortlisted: analytics.passRate?.passedCount ?? 0,
        averageScore: analytics.scores?.averageScore ?? 75,
        highestScore: analytics.scores?.highestScore ?? 100,
        lowestScore: analytics.scores?.lowestScore ?? 0,
        passPercentage: analytics.passRate?.passPercentage ?? 80,
      };
    }
  } catch (err) {
    console.warn("Live assessment analytics API fallback:", err.message);
  }

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
  try {
    const res = await axiosClient.get(
      `/attempts/assessments/${assessmentId}/results/${resultId}`
    );
    const item = res?.data?.data || res?.data;
    if (item && (item.attemptId || item.id)) {
      return {
        id: item.attemptId || item.id,
        attemptId: item.attemptId || item.id,
        assessmentId,
        candidate: item.candidate || {
          name: `${item.candidate?.firstName || ""} ${item.candidate?.lastName || ""}`.trim() || "Candidate",
        },
        score: item.score ?? 0,
        answers: item.answers ?? [],
        sections: item.answers ?? [],
        status: "Completed",
      };
    }
  } catch (err) {
    console.warn("Live getResultById API fallback:", err.message);
  }

  await delay(500);

  const result = results.find(
    (item) =>
      String(item.id) === String(resultId) &&
      (assessmentId ? String(item.assessmentId) === String(assessmentId) : true)
  );

  if (!result) {
    throw new Error("Candidate result not found.");
  }

  return { ...result };
};

export const createAssessmentResult = async ({ attempt, assignment, score }) => {
  const calculatedScore = typeof score === "object" ? (score?.score ?? score?.percentage ?? 85) : (Number(score) || 85);
  try {
    await axiosClient.post("/results/submit", {
      token: assignment?.token || assignment?.invitationToken,
      candidateId: assignment?.candidateId,
      email: assignment?.email || assignment?.candidateEmail,
      assessmentId: assignment?.assessmentId,
      score: calculatedScore,
      timeSpent: attempt?.timeSpent || "24m 12s",
      gameResults: attempt?.gameResults || [],
      answers: attempt?.responses || [],
    });
  } catch (err) {
    console.warn("Backend submit result API error:", err.message);
  }

  await delay(300);

  const existing = results.find(
    (result) => String(result.attemptId) === String(attempt?.id)
  );

  if (existing) {
    return { ...existing };
  }

  const result = {
    id: crypto.randomUUID(),
    attemptId: attempt?.id,
    assignmentId: assignment?.id,
    candidateId: assignment?.candidateId,
    assessmentId: assignment?.assessmentId,
    hiringProcessId: assignment?.hiringProcessId,
    roundId: assignment?.roundId,
    candidate: {
      id: assignment?.candidateId,
      name: assignment?.candidateName || "Candidate",
      email: assignment?.email || "candidate@example.com",
    },
    assessment: {
      id: assignment?.assessmentId,
      title: assignment?.assessment?.title || "Assessment",
    },
    status: "Completed",
    score: calculatedScore,
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
