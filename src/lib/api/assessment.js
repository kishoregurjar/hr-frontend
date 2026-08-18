import { assessments } from "@/features/assessment/data";

export const getAssessments = async () => {
  return Promise.resolve({
    success: true,
    data: assessments,
  });
};

export const getAssessmentById = async (id) => {
  const assessment = assessments.find((item) => item.id === id);

  return Promise.resolve({
    success: true,
    data: assessment,
  });
};
