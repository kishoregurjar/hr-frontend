const ATTEMPTS_STORAGE_KEY = "hirequest_attempts_cache";

const getCachedAttempts = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ATTEMPTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveCachedAttempts = (list) => {
  if (typeof window === "undefined" || !Array.isArray(list)) return;
  try {
    localStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(list));
  } catch {}
};

let attempts = getCachedAttempts();

const MAX_INTEGRITY_EVENTS = 100;

const delay = (ms = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const getAttempts = async () => {
  const cached = getCachedAttempts();
  if (cached.length > 0) attempts = cached;
  return [...attempts];
};

export const getAttemptById = async (attemptId) => {
  // 1. Try Live Backend GET /attempts/:id
  try {
    const res = await axiosClient.get(`/attempts/${attemptId}`);
    const liveAttempt = res?.data?.data || res?.data || res;
    if (liveAttempt && (liveAttempt.id || liveAttempt.assessmentId)) {
      return {
        ...liveAttempt,
        id: liveAttempt.id || attemptId,
        status: liveAttempt.status || "In Progress",
        durationMinutes: liveAttempt.durationMinutes || 60,
        responses: liveAttempt.responses || {},
        gameResults: liveAttempt.gameResults || {},
      };
    }
  } catch (err) {
    console.warn("Live attempt fetch notice:", err?.message);
  }

  // 2. Check local memory & persistent storage
  const cached = getCachedAttempts();
  if (cached.length > 0) attempts = cached;

  const attempt = attempts.find(
    (a) => String(a.id) === String(attemptId)
  );

  if (attempt) {
    return { ...attempt };
  }

  // 3. Graceful Auto-Recovery of active attempt session
  const defaultAssessmentId = "cmtjpcxzw0001vd0glu1856";
  const recoveredAttempt = {
    id: attemptId,
    assignmentId: `inv-${Date.now()}`,
    candidateId: "cand-active-01",
    assessmentId: defaultAssessmentId,
    status: "In Progress",
    durationMinutes: 60,
    startedAt: new Date().toISOString(),
    submittedAt: null,
    currentSection: 0,
    currentItemIndex: 0,
    responses: {},
    gameResults: {},
    score: null,
    lastSavedAt: new Date().toISOString(),
    integrity: {
      tabSwitchCount: 0,
      windowBlurCount: 0,
      fullscreenExitCount: 0,
      events: [],
    },
  };

  attempts = [recoveredAttempt, ...attempts.filter((a) => a.id !== attemptId)];
  saveCachedAttempts(attempts);
  return recoveredAttempt;
};

export const getAttemptByAssignmentId = async (assignmentId) => {
  const cached = getCachedAttempts();
  if (cached.length > 0) attempts = cached;

  const attempt = attempts.find(
    (a) => String(a.assignmentId) === String(assignmentId)
  );

  return attempt ? { ...attempt } : null;
};

export const startAttempt = async ({
  assignmentId,
  candidateId,
  assessmentId,
  hiringProcessId,
  roundId,
  durationMinutes = 60,
  token,
}) => {
  const cached = getCachedAttempts();
  if (cached.length > 0) attempts = cached;

  const existingAttempt = attempts.find(
    (a) => String(a.assignmentId) === String(assignmentId)
  );

  if (existingAttempt) {
    return { ...existingAttempt };
  }

  const now = new Date().toISOString();
  const attemptId = `att_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // Attempt live backend start
  if (token) {
    try {
      const res = await axiosClient.post("/attempts/start", { token, assessmentId });
      const liveData = res?.data?.data || res?.data || res;
      if (liveData?.id) {
        const liveAttempt = {
          id: liveData.id,
          assignmentId,
          candidateId,
          assessmentId: liveData.assessmentId || assessmentId,
          status: "In Progress",
          durationMinutes: Number(durationMinutes) || 60,
          startedAt: now,
          submittedAt: null,
          currentSection: 0,
          currentItemIndex: 0,
          responses: {},
          gameResults: {},
          score: null,
          integrity: {
            tabSwitchCount: 0,
            windowBlurCount: 0,
            fullscreenExitCount: 0,
            events: [],
          },
        };
        attempts = [liveAttempt, ...attempts.filter((a) => a.id !== liveAttempt.id)];
        saveCachedAttempts(attempts);
        return liveAttempt;
      }
    } catch (e) {
      console.warn("Live backend attempt start notice:", e?.message);
    }
  }

  const attempt = {
    id: attemptId,
    assignmentId: assignmentId || `inv-${Date.now()}`,
    candidateId: candidateId || "cand-active-01",
    assessmentId: assessmentId || "cmtjpcxzw0001vd0glu1856",
    hiringProcessId,
    roundId,
    status: "In Progress",
    durationMinutes: Number(durationMinutes) || 60,
    startedAt: now,
    submittedAt: null,
    currentSection: 0,
    currentItemIndex: 0,
    responses: {},
    gameResults: {},
    score: null,
    lastSavedAt: null,
    integrity: {
      tabSwitchCount: 0,
      windowBlurCount: 0,
      fullscreenExitCount: 0,
      events: [],
    },
  };

  attempts = [attempt, ...attempts.filter((a) => a.id !== attempt.id)];
  saveCachedAttempts(attempts);
  return { ...attempt };
};

export const createAttempt = startAttempt;

export const recordIntegrityEvent = async ({ attemptId, type }) => {
  await delay(100);

  const index = attempts.findIndex(
    (attempt) => String(attempt.id) === String(attemptId)
  );

  if (index === -1) {
    throw new Error("Attempt not found.");
  }

  const attempt = attempts[index];

  if (attempt.status !== "In Progress") {
    return { ...attempt };
  }

  const currentIntegrity = attempt.integrity ?? {
    tabSwitchCount: 0,
    windowBlurCount: 0,
    fullscreenExitCount: 0,
    events: [],
  };

  const existingEvents = currentIntegrity.events ?? [];
  const lastEvent = existingEvents[existingEvents.length - 1];
  const now = Date.now();

  const isDuplicate =
    lastEvent &&
    lastEvent.type === type &&
    now - new Date(lastEvent.timestamp).getTime() < 500;

  if (isDuplicate) {
    return { ...attempts[index] };
  }

  const event = {
    id: crypto.randomUUID(),
    type,
    timestamp: new Date().toISOString(),
  };

  const updatedEvents = [...existingEvents, event].slice(-MAX_INTEGRITY_EVENTS);

  const integrity = {
    ...currentIntegrity,
    events: updatedEvents,
    tabSwitchCount:
      (currentIntegrity.tabSwitchCount ?? 0) + (type === "TAB_HIDDEN" ? 1 : 0),
    windowBlurCount:
      (currentIntegrity.windowBlurCount ?? 0) + (type === "WINDOW_BLUR" ? 1 : 0),
    fullscreenExitCount:
      (currentIntegrity.fullscreenExitCount ?? 0) +
      (type === "FULLSCREEN_EXIT" ? 1 : 0),
  };

  attempts[index] = {
    ...attempt,
    integrity,
  };

  return { ...attempts[index] };
};

export const updateAttemptProgress = async ({
  attemptId,
  currentSection,
}) => {
  await delay(300);

  const index = attempts.findIndex(
    (attempt) => String(attempt.id) === String(attemptId)
  );

  if (index === -1) {
    throw new Error("Assessment attempt not found.");
  }

  if (attempts[index].status !== "In Progress") {
    throw new Error("This attempt is not active.");
  }

  attempts[index] = {
    ...attempts[index],
    currentSection,
  };

  return { ...attempts[index] };
};

export const saveAttemptProgress = async ({
  attemptId,
  responses = [],
  currentItemIndex = 0,
}) => {
  await delay(250);

  const index = attempts.findIndex(
    (attempt) => String(attempt.id) === String(attemptId)
  );

  if (index === -1) {
    throw new Error("Attempt not found.");
  }

  if (attempts[index].status !== "In Progress") {
    throw new Error("Completed attempt cannot be modified.");
  }

  attempts[index] = {
    ...attempts[index],
    responses: Array.isArray(responses)
      ? [...responses]
      : { ...responses },
    currentItemIndex,
    lastSavedAt: new Date().toISOString(),
  };

  return { ...attempts[index] };
};

export const saveQuizResponse = async ({
  attemptId,
  sectionId,
  questionId,
  optionId,
}) => {
  await delay(300);

  const index = attempts.findIndex(
    (attempt) => String(attempt.id) === String(attemptId)
  );

  if (index === -1) {
    throw new Error("Assessment attempt not found.");
  }

  const attempt = attempts[index];

  if (attempt.status !== "In Progress") {
    throw new Error("This assessment attempt is not active.");
  }

  const currentResponses = attempt.responses ?? {};
  const sectionResponses = currentResponses[sectionId] ?? {};

  attempts[index] = {
    ...attempt,
    responses: {
      ...currentResponses,
      [sectionId]: {
        ...sectionResponses,
        [questionId]: optionId,
      },
    },
    lastSavedAt: new Date().toISOString(),
  };

  return { ...attempts[index] };
};

export const saveGameResult = async ({
  attemptId,
  sectionId,
  result,
}) => {
  await delay(400);

  const index = attempts.findIndex(
    (attempt) => String(attempt.id) === String(attemptId)
  );

  if (index === -1) {
    throw new Error("Assessment attempt not found.");
  }

  const attempt = attempts[index];

  if (attempt.status !== "In Progress") {
    throw new Error("This assessment attempt is not active.");
  }

  const currentGameResults = attempt.gameResults ?? {};

  attempts[index] = {
    ...attempt,
    gameResults: {
      ...currentGameResults,
      [sectionId]: {
        ...result,
        completedAt: new Date().toISOString(),
      },
    },
    lastSavedAt: new Date().toISOString(),
  };

  return { ...attempts[index] };
};

export const completeAttempt = async ({ attemptId, assessment, responses }) => {
  await delay(500);

  const index = attempts.findIndex(
    (attempt) => String(attempt.id) === String(attemptId)
  );

  if (index === -1) {
    throw new Error("Assessment attempt not found.");
  }

  const attempt = attempts[index];

  if (attempt.status === "Completed") {
    return { ...attempt };
  }

  const scoringResult = calculateAssessmentScore({ assessment, attempt });

  attempts[index] = {
    ...attempt,
    ...(responses ? { responses: Array.isArray(responses) ? [...responses] : responses } : {}),
    status: "Completed",
    score: scoringResult.score,
    quizScore: scoringResult.quizScore,
    gameScore: scoringResult.gameScore,
    sectionScores: scoringResult.sections,
    submittedAt: new Date().toISOString(),
  };

  return { ...attempts[index] };
};

export const submitAttempt = async ({ attemptId, assessment }) => {
  return completeAttempt({ attemptId, assessment });
};

/**
 * Step 3: Send Candidate Email OTP — POST /api/v1/attempts/candidate/send-otp
 */
export const sendCandidateOtp = async ({ email, invitationToken }) => {
  try {
    const res = await axiosClient.post("/attempts/candidate/send-otp", {
      email,
      invitationToken,
    });
    return res?.data || res;
  } catch (err) {
    console.warn("Live sendCandidateOtp API:", err.message);
    throw err;
  }
};

/**
 * Step 4: Verify Candidate OTP & Get Session Access Token — POST /api/v1/attempts/candidate/verify-otp
 */
export const verifyCandidateOtp = async ({ email, otp, invitationToken }) => {
  try {
    const res = await axiosClient.post("/attempts/candidate/verify-otp", {
      email,
      otp,
      invitationToken,
    });
    return res?.data?.data || res?.data || res;
  } catch (err) {
    console.warn("Live verifyCandidateOtp API:", err.message);
    throw err;
  }
};

/**
 * Step 5: Start Attempt by Token / Session — POST /api/v1/attempts/start-by-token
 */
export const startAttemptByToken = async (token, candidateAccessToken = null) => {
  try {
    const headers = candidateAccessToken
      ? { Authorization: `Bearer ${candidateAccessToken}` }
      : {};
    const res = await axiosClient.post(
      "/attempts/start-by-token",
      token ? { token } : {},
      { headers }
    );
    return res?.data?.data || res?.data || res;
  } catch (err) {
    console.warn("Live startAttemptByToken API:", err.message);
    throw err;
  }
};

/**
 * Step 6: Get Current Active Attempt State — GET /api/v1/attempts/current
 */
export const getCurrentAttempt = async (token, candidateAccessToken = null) => {
  try {
    const headers = candidateAccessToken
      ? { Authorization: `Bearer ${candidateAccessToken}` }
      : {};
    const res = await axiosClient.get("/attempts/current", {
      params: token ? { token } : {},
      headers,
    });
    return res?.data?.data || res?.data || res;
  } catch (err) {
    console.warn("Live getCurrentAttempt API:", err.message);
    return null;
  }
};

/**
 * Step 7: Real-Time Answer Autosave (Objective / Subjective) — POST /api/v1/attempts/save-answer
 */
export const saveAttemptAnswer = async ({
  token,
  attemptId,
  questionId,
  attemptQuestionId,
  selectedOptionIds,
  answerText,
  candidateAccessToken = null,
}) => {
  try {
    const headers = candidateAccessToken
      ? { Authorization: `Bearer ${candidateAccessToken}` }
      : {};
    const payload = {
      attemptQuestionId: attemptQuestionId || questionId,
      ...(selectedOptionIds ? { selectedOptionIds } : {}),
      ...(answerText !== undefined ? { answerText } : {}),
      ...(token ? { token } : {}),
    };

    const res = await axiosClient.post("/attempts/save-answer", payload, {
      headers,
    });
    return res?.data?.data || res?.data || res;
  } catch (err1) {
    try {
      const res = await axiosClient.put(
        `/assessment-attempts/${attemptId}/answers/${questionId}`,
        { selectedOptionIds, answerText }
      );
      return res?.data?.data || res?.data || res;
    } catch (err2) {
      console.warn("Live saveAttemptAnswer fallback:", err2.message);
      return null;
    }
  }
};

/**
 * Step 8: Final Assessment Submission — POST /api/v1/attempts/submit
 */
export const submitAssessmentAttempt = async ({
  token,
  attemptId,
  candidateAccessToken = null,
}) => {
  try {
    const headers = candidateAccessToken
      ? { Authorization: `Bearer ${candidateAccessToken}` }
      : {};
    const res = await axiosClient.post(
      "/attempts/submit",
      token ? { token } : {},
      { headers }
    );
    return res?.data?.data || res?.data || res;
  } catch (err1) {
    try {
      const res = await axiosClient.post(`/assessment-attempts/${attemptId}/submit`);
      return res?.data?.data || res?.data || res;
    } catch (err2) {
      console.warn("Live submitAttempt fallback:", err2.message);
      return null;
    }
  }
};

/**
 * Step 9: Manual Evaluation of Subjective Answers by HR — POST /api/v1/attempts/:attemptId/evaluate-answer
 */
export const evaluateSubjectiveAnswer = async ({
  attemptId,
  attemptAnswerId,
  evaluationStatus,
  marksAwarded,
}) => {
  try {
    const res = await axiosClient.post(
      `/attempts/${attemptId}/evaluate-answer`,
      {
        attemptAnswerId,
        evaluationStatus,
        marksAwarded,
      }
    );
    return res?.data?.data || res?.data || res;
  } catch (err) {
    console.warn("Live evaluateSubjectiveAnswer API:", err.message);
    throw err;
  }
};

/**
 * Step 11: HR Paginated Results List — GET /api/v1/attempts?page=1&limit=10&status=SUBMITTED
 */
export const getPaginatedAttempts = async (params = {}) => {
  try {
    const res = await axiosClient.get("/attempts", { params });
    return res?.data?.data || res?.data || res;
  } catch (err) {
    console.warn("Live getPaginatedAttempts API:", err.message);
    return [];
  }
};
