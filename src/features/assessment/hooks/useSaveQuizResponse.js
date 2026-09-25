"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ATTEMPT_QUERY_KEYS } from "../constants";
import { attemptService } from "../services";

const useSaveQuizResponse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => attemptService.saveQuizResponse(payload),

    onMutate: async (variables) => {
      const { attemptId, sectionId, questionId, optionId, selectedOptionIds } = variables || {};
      const chosenOption = optionId || (Array.isArray(selectedOptionIds) && selectedOptionIds[0]) || null;

      // 1. Optimistic Cache Update (0ms Instant UI Reflection)
      queryClient.setQueriesData(
        { queryKey: ATTEMPT_QUERY_KEYS.all },
        (oldAttempt) => {
          if (!oldAttempt || typeof oldAttempt !== "object") return oldAttempt;

          const existingResponses = oldAttempt.responses || {};
          const sectionResponses = existingResponses[sectionId] || {};

          const updatedSection = {
            ...sectionResponses,
            [questionId]: chosenOption,
          };

          return {
            ...oldAttempt,
            responses: {
              ...existingResponses,
              [sectionId]: updatedSection,
            },
          };
        }
      );
    },

    onSuccess: (attempt) => {
      if (!attempt?.id) return;

      queryClient.setQueryData(
        ATTEMPT_QUERY_KEYS.detail(attempt.id),
        (old) => ({
          ...(old || {}),
          ...(attempt || {}),
          responses: {
            ...(old?.responses || {}),
            ...(attempt?.responses || {}),
          },
        })
      );

      if (attempt.assignmentId) {
        queryClient.setQueryData(
          ATTEMPT_QUERY_KEYS.assignment(attempt.assignmentId),
          (old) => ({
            ...(old || {}),
            ...(attempt || {}),
            responses: {
              ...(old?.responses || {}),
              ...(attempt?.responses || {}),
            },
          })
        );
      }
    },
  });
};

export default useSaveQuizResponse;
