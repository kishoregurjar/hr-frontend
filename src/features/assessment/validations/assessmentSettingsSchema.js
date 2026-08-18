import { z } from "zod";

export const assessmentSettingsSchema = z.object({
  duration: z.coerce
    .number()
    .min(5, "Duration must be at least 5 minutes")
    .max(300, "Duration cannot exceed 300 minutes"),

  passingScore: z.coerce
    .number()
    .min(0, "Passing score cannot be below 0")
    .max(100, "Passing score cannot exceed 100"),

  attemptsAllowed: z.coerce
    .number()
    .int("Attempts must be a whole number")
    .min(1, "At least 1 attempt is required")
    .max(5, "Maximum 5 attempts are allowed"),

  shuffleQuestions: z.boolean(),

  showResultToCandidate: z.boolean(),
});
