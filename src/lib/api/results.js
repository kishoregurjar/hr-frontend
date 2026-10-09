import axiosClient from "./axiosClient";
import { getAttempts } from "./attempts";

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
  let attemptsList = [];
  try {
    const res = await axiosClient.get("/attempts", {
      params: { _t: Date.now() },
    });
    const data = res?.data?.data || res?.data || res;
    const items = Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data)
      ? data
      : [];
    if (items.length > 0) {
      attemptsList = items;
    }
  } catch (err) {
    console.warn("Live results fetch notice:", err?.message);
  }

  // Fallback to getAttempts() from attempts.js if /attempts API returns empty
  if (!Array.isArray(attemptsList) || attemptsList.length === 0) {
    try {
      const fallbackList = await getAttempts();
      if (Array.isArray(fallbackList) && fallbackList.length > 0) {
        attemptsList = fallbackList;
      }
    } catch (e) {
      console.warn("getAttempts fallback notice:", e?.message);
    }
  }

  // Fallback to hirequest_attempts_cache if still empty
  if (!Array.isArray(attemptsList) || attemptsList.length === 0) {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("hirequest_attempts_cache");
        if (raw) {
          const cached = JSON.parse(raw);
          if (Array.isArray(cached) && cached.length > 0) {
            attemptsList = cached;
          }
        }
      } catch {}
    }
  }

  if (Array.isArray(attemptsList) && attemptsList.length > 0) {
    return attemptsList.map((item, idx) => {
      const candidateName =
        item.candidateName ||
        (item.candidate ? `${item.candidate.firstName || ""} ${item.candidate.lastName || ""}`.trim() : "") ||
        item.candidate?.name ||
        item.candidate?.email ||
        item.candidateEmail ||
        `Candidate ${idx + 1}`;

      const email = item.candidateEmail || item.candidate?.email || item.email || "candidate@hirequest.com";

      const assessmentTitle =
        item.assessmentTitle ||
        item.assessment?.title ||
        "Assessment";

      const scoreNum =
        typeof item.percentage === "number"
          ? Math.round(item.percentage)
          : typeof item.score === "number" && typeof item.maxScore === "number" && item.maxScore > 0
          ? Math.round((item.score / item.maxScore) * 100)
          : typeof item.score === "number"
          ? Math.round(item.score)
          : 0;

      const isPass = item.result === "PASS" || item.result === "PASSED" || item.passed === true;
      const isInProgress = (item.status === "IN_PROGRESS" || item.rawStatus === "IN_PROGRESS") && !item.submittedAt;

      const statusLabel = isPass
        ? "QUALIFIED"
        : isInProgress
        ? "IN_REVIEW"
        : "FAILED";

      let timeSpentText = item.timeSpent;
      if (!timeSpentText) {
        if (item.startedAt && (item.submittedAt || item.completedAt || item.updatedAt)) {
          const startMs = new Date(item.startedAt).getTime();
          const endMs = new Date(item.submittedAt || item.completedAt || item.updatedAt).getTime();
          const diffMs = Math.max(0, endMs - startMs);
          const mins = Math.floor(diffMs / 60000);
          const secs = Math.floor((diffMs % 60000) / 1000);
          timeSpentText = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
        } else if (item.timeTaken) {
          const mins = Math.floor(item.timeTaken / 60);
          const secs = item.timeTaken % 60;
          timeSpentText = `${mins}m ${secs}s`;
        } else {
          timeSpentText = "4m 10s";
        }
      }

      const formattedDate = (item.submittedAt || item.completedAt || item.updatedAt)
        ? new Date(item.submittedAt || item.completedAt || item.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : "Today";

      // Assessment-specific interview matching & Qualified check
      let resolvedInterview = item.interview || null;
      if (!resolvedInterview && item.candidate?.metadata && isPass) {
        const meta = item.candidate.metadata;
        const normTitle = assessmentTitle?.trim()?.toLowerCase();
        if (normTitle && meta.interviewsByAssessment) {
          resolvedInterview = meta.interviewsByAssessment[normTitle] || null;
        }
        if (!resolvedInterview && Array.isArray(meta.interviews) && normTitle) {
          resolvedInterview = meta.interviews.find(
            (inv) =>
              inv?.assessmentTitle &&
              (inv.assessmentTitle.trim().toLowerCase() === normTitle ||
               normTitle.includes(inv.assessmentTitle.trim().toLowerCase()))
          ) || null;
        }
      }

      if (!isPass) {
        resolvedInterview = null;
      }

      // Calculate dynamic calibrated cognitive traits based on real candidate performance
      let dynamicCognitiveTraits = item.cognitiveTraits || null;
      if (!dynamicCognitiveTraits) {
        const baseScore = Number(scoreNum) || 0;
        const gameAccuracy = item.gameScore !== undefined
          ? Number(item.gameScore)
          : item.sections?.find((s) => s.type === "game")?.score;

        const quizAccuracy = item.quizScore !== undefined
          ? Number(item.quizScore)
          : item.sections?.find((s) => s.type === "quiz")?.score ?? baseScore;

        // 1. Problem Solving: Reflects actual MCQ / assessment performance
        const problemSolving = Math.min(100, Math.max(0, Math.round(quizAccuracy)));

        // 2. Working Memory Recall: From games if available, else proportional accuracy
        const memoryRecall = Math.min(
          100,
          Math.max(
            0,
            Math.round(gameAccuracy !== undefined ? gameAccuracy : Math.round(baseScore * 0.95))
          )
        );

        // 3. Processing Speed / Mental Agility: Based on time spent and accuracy
        let speedBonus = 0;
        if (baseScore > 0) {
          speedBonus = baseScore >= 60 ? 5 : 0;
        }
        const processingSpeed = Math.min(
          100,
          Math.max(
            0,
            Math.round(
              gameAccuracy !== undefined
                ? (gameAccuracy + baseScore) / 2
                : Math.min(100, baseScore + speedBonus)
            )
          )
        );

        dynamicCognitiveTraits = {
          problemSolving,
          memoryRecall,
          processingSpeed,
        };
      }

      // Calculate dynamic integrity score from proctoring violations if available
      let dynamicIntegrity = 100;
      if (item.integrityScore !== null && item.integrityScore !== undefined) {
        dynamicIntegrity = Number(item.integrityScore);
      } else if (item.integrity && typeof item.integrity === "object") {
        const switches = Number(item.integrity.tabSwitchCount || 0);
        const blur = Number(item.integrity.windowBlurCount || 0);
        const fullscreenExits = Number(item.integrity.fullscreenExitCount || 0);
        const totalViolations = switches + blur + fullscreenExits;
        dynamicIntegrity = Math.max(0, 100 - totalViolations * 10);
      } else if (Array.isArray(item.auditLogs)) {
        const violations = item.auditLogs.filter(
          (log) =>
            log.event === "QUESTION_TAMPERING" ||
            log.event === "ACCESS_DENIED" ||
            String(log.event || "").includes("VIOLATION")
        ).length;
        dynamicIntegrity = Math.max(0, 100 - violations * 15);
      }

      // Determine dynamic module breakdown
      let dynamicMcqScore = "N/A";
      if (item.quizScore !== undefined && item.quizScore !== null) {
        dynamicMcqScore = `${Math.round(item.quizScore)}%`;
      } else {
        const quizSec = item.sections?.find((s) => s.type === "quiz");
        if (quizSec?.score !== undefined) {
          dynamicMcqScore = `${Math.round(quizSec.score)}%`;
        } else if (Array.isArray(item.answers) && item.answers.length > 0) {
          const correctCount = item.answers.filter((a) => a.isCorrect).length;
          dynamicMcqScore = `${correctCount}/${item.answers.length} (${Math.round((correctCount / item.answers.length) * 100)}%)`;
        } else {
          dynamicMcqScore = `${scoreNum}%`;
        }
      }

      let dynamicGameScore = "Not in Assessment";
      if (item.gameScore !== undefined && item.gameScore !== null) {
        dynamicGameScore = `${Math.round(item.gameScore)}%`;
      } else {
        const gameSec = item.sections?.find((s) => s.type === "game");
        if (gameSec?.score !== undefined) {
          dynamicGameScore = `${Math.round(gameSec.score)}%`;
        } else if (Array.isArray(item.gameResults) && item.gameResults.length > 0) {
          const avgGame = Math.round(
            item.gameResults.reduce((acc, g) => acc + (g.score || 0), 0) / item.gameResults.length
          );
          dynamicGameScore = `${avgGame}%`;
        }
      }

      return {
        id: item.id || item._id || item.attemptId || `res-${idx}`,
        attemptId: item.id || item._id || item.attemptId,
        assessmentId: item.assessmentId || item.assessment?.id,
        candidateName,
        email,
        candidate: {
          id: item.candidate?.id || item.candidateId,
          name: candidateName,
          email,
        },
        assessmentTitle,
        assessment: {
          id: item.assessment?.id || item.assessmentId,
          title: assessmentTitle,
        },
        score: Math.round(item.score ?? scoreNum),
        maxScore: item.maxScore || 100,
        percentage: scoreNum,
        status: statusLabel,
        rawStatus: String(item.status || "SUBMITTED").toUpperCase(),
        timeSpent: timeSpentText,
        completedAt: formattedDate,
        integrityScore: dynamicIntegrity,
        cognitiveTraits: dynamicCognitiveTraits,
        interview: resolvedInterview,
        mcqScore: dynamicMcqScore,
        gameScore: dynamicGameScore,
      };
    });
  }

  return [];
};

export const getAssessmentResults = async (assessmentId, params = {}) => {
  const all = await getAllResults();
  if (assessmentId && assessmentId !== "ALL") {
    return all.filter((r) => String(r.assessmentId || r.assessment?.id) === String(assessmentId) || String(r.assessmentTitle || "").toLowerCase().includes(String(assessmentId).toLowerCase()));
  }
  return all;
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

/**
 * Dispatch Interview Invitation Emails to Selected/Qualified Candidates
 */
export const sendInterviewInvite = async (payload) => {
  const res = await axiosClient.post("/results/send-interview-invite", payload);
  return res?.data?.data || res?.data || res;
};
