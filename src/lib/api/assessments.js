import axiosClient from "./axiosClient";

let localAssessments = [];

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
