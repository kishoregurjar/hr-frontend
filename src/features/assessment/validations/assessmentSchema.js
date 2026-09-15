import { z } from "zod";

export const assessmentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Assessment title is required")
    .max(100, "Assessment title cannot exceed 100 characters"),

  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),

  selectedGameIds: z
    .array(z.union([z.string(), z.number()])),

  selectedQuestionIds: z
    .array(z.union([z.string(), z.number()])),

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
}).refine(
  (data) =>
    (data.selectedGameIds && data.selectedGameIds.length > 0) ||
    (data.selectedQuestionIds && data.selectedQuestionIds.length > 0),
  {
    message: "Select at least one game OR at least one question",
    path: ["selectedQuestionIds"],
  }
);
