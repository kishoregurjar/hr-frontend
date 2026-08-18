import axiosClient from "./axiosClient";

let localAssessments = [
  {
    id: "ass-001",
    title: "Frontend Developer Hiring",
    description: "Assessment for hiring React and Next.js frontend developers.",
    difficulty: "Medium",
    duration: 45,
    passingScore: 70,
    attemptsAllowed: 1,
    shuffleQuestions: true,
    showResultToCandidate: false,
    status: "Published",
    gameIds: [],
    questionIds: [],
    candidateCount: 120,
    createdAt: "2026-07-20T10:00:00.000Z",
    updatedAt: "2026-07-24T10:00:00.000Z",
  },
  {
    id: "ass-002",
    title: "Java Backend Assessment",
    description: "Assessment focused on Java, Spring Boot and SQL.",
    difficulty: "Hard",
    duration: 60,
    passingScore: 75,
    attemptsAllowed: 1,
    shuffleQuestions: false,
    showResultToCandidate: false,
    status: "Draft",
    gameIds: [],
    questionIds: [],
    candidateCount: 0,
    createdAt: "2026-07-22T10:00:00.000Z",
    updatedAt: "2026-07-24T10:00:00.000Z",
  },
  {
    id: "ass-003",
    title: "React Internship Hiring",
    description: "Entry level assessment for React internship candidates.",
    difficulty: "Easy",
    duration: 30,
    passingScore: 60,
    attemptsAllowed: 2,
    shuffleQuestions: true,
    showResultToCandidate: true,
    status: "Published",
    gameIds: [],
    questionIds: [],
    candidateCount: 58,
    createdAt: "2026-07-18T10:00:00.000Z",
    updatedAt: "2026-07-23T10:00:00.000Z",
  },
  {
    id: "ass-004",
    title: "Full Stack Node.js Test",
    description: "Comprehensive assessment for full-stack Node.js developers.",
    difficulty: "Hard",
    duration: 75,
    passingScore: 72,
    attemptsAllowed: 1,
    shuffleQuestions: true,
    showResultToCandidate: false,
    status: "Published",
    gameIds: [],
    questionIds: [],
    candidateCount: 34,
    createdAt: "2026-07-15T10:00:00.000Z",
    updatedAt: "2026-07-22T10:00:00.000Z",
  },
];

export const getAssessments = async () => {
  try {
    const res = await axiosClient.get("/assessments");
    return res?.data?.items || res?.data || res || [...localAssessments];
  } catch {
    return [...localAssessments];
  }
};

export const getAssessmentById = async (id) => {
  try {
    const res = await axiosClient.get(`/assessments/${id}`);
    return res?.data || res;
  } catch {
    const found = localAssessments.find((item) => String(item.id) === String(id));
    if (found) return found;
    throw new Error("Assessment not found");
  }
};

export const createAssessment = async (payload) => {
  try {
    const res = await axiosClient.post("/assessments", payload);
    return res?.data || res;
  } catch {
    const newItem = {
      id: `ass-${Date.now()}`,
      ...payload,
      candidateCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localAssessments = [newItem, ...localAssessments];
    return newItem;
  }
};

export const updateAssessment = async (id, payload) => {
  try {
    const res = await axiosClient.put(`/assessments/${id}`, payload);
    return res?.data || res;
  } catch {
    const idx = localAssessments.findIndex((item) => String(item.id) === String(id));
    if (idx !== -1) {
      localAssessments[idx] = {
        ...localAssessments[idx],
        ...payload,
        updatedAt: new Date().toISOString(),
      };
      return localAssessments[idx];
    }
    throw new Error("Assessment not found");
  }
};

export const publishAssessment = async (id) => {
  try {
    const res = await axiosClient.post(`/assessments/${id}/publish`);
    return res?.data || res;
  } catch {
    return updateAssessment(id, { status: "Published" });
  }
};
