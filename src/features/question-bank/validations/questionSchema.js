import { z } from "zod";

export const questionSchema = z
  .object({
    question: z
      .string()
      .trim()
      .min(
        10,
        "Question must be at least 10 characters"
      ),

    category: z
      .string()
      .trim()
      .min(1, "Category is required"),

    difficulty: z.string().min(1),

    status: z.string().min(1),

    type: z.string().min(1),

    optionA: z
      .string()
      .trim()
      .min(1, "Option A is required"),

    optionB: z
      .string()
      .trim()
      .min(1, "Option B is required"),

    optionC: z
      .string()
      .trim()
      .min(1, "Option C is required"),

    optionD: z
      .string()
      .trim()
      .min(1, "Option D is required"),

    correctAnswer: z.enum([
      "optionA",
      "optionB",
      "optionC",
      "optionD",
    ], {
      errorMap: () => ({ message: "Select the correct answer" })
    }),
  })
  .refine(
    (data) => {
      const options = [
        data.optionA,
        data.optionB,
        data.optionC,
        data.optionD,
      ].map((option) =>
        option.trim().toLowerCase()
      );

      return new Set(options).size === options.length;
    },
    {
      message: "Answer options must be unique",
      path: ["optionD"],
    }
  );
