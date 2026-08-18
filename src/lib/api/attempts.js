import { calculateAssessmentScore } from "@/lib/scoring";

let attempts = [];

const MAX_INTEGRITY_EVENTS = 100;

const delay = (ms = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const getAttempts = async () => {
  await delay();
  return [...attempts];
};

export const getAttemptById = async (attemptId) => {
  await delay();

  const attempt = attempts.find(
    (attempt) => String(attempt.id) === String(attemptId)
  );

  if (!attempt) {
    throw new Error("Assessment attempt not found.");
  }

  return { ...attempt };
};

export const getAttemptByAssignmentId = async (assignmentId) => {
  await delay();

  const attempt = attempts.find(
    (attempt) => String(attempt.assignmentId) === String(assignmentId)
  );

  return attempt ? { ...attempt } : null;
};

export const startAttempt = async ({
  assignmentId,
  candidateId,
  assessmentId,
  hiringProcessId,
  roundId,
  durationMinutes = 45,
}) => {
  await delay(500);

  const existingAttempt = attempts.find(
    (attempt) => String(attempt.assignmentId) === String(assignmentId)
  );

  if (existingAttempt) {
    return { ...existingAttempt };
  }

  const now = new Date().toISOString();

  const attempt = {
    id: crypto.randomUUID(),
    assignmentId,
    candidateId,
    assessmentId,
    hiringProcessId,
    roundId,
    status: "In Progress",
    durationMinutes: Number(durationMinutes) || 45,
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

  attempts.push(attempt);
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
