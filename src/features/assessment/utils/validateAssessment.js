import { assessmentSchema } from "../validations";

export const validateAssessment = (assessment) => {
  const result = assessmentSchema.safeParse(assessment);

  if (result.success) {
    return {
      isValid: true,
      errors: {},
    };
  }

  const errors = {};

  result.error.issues.forEach((issue) => {
    const field = issue.path[0];

    if (!errors[field]) {
      errors[field] = issue.message;
    }
  });

  return {
    isValid: false,
    errors,
  };
};
