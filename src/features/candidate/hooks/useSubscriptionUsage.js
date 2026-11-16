"use client";

import { useQuery } from "@tanstack/react-query";
import { getCurrentSubscription } from "@/lib/api/plans";

export const SUBSCRIPTION_USAGE_QUERY_KEY = ["company", "subscription", "current"];

export default function useSubscriptionUsage(options = {}) {
  const query = useQuery({
    queryKey: SUBSCRIPTION_USAGE_QUERY_KEY,
    queryFn: async () => {
      try {
        const data = await getCurrentSubscription();
        return data || null;
      } catch (err) {
        return null;
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    ...options,
  });

  const subscription = query.data;

  // Extract monthly assessment invitation quotas
  const rawInviteLimit =
    subscription?.effectiveLimits?.inviteLimit ??
    subscription?.usage?.invitations?.limit ??
    subscription?.limits?.monthlyInvitations ??
    null;

  const inviteLimit = rawInviteLimit !== null && rawInviteLimit !== undefined ? Number(rawInviteLimit) : null;

  const inviteUsed = Number(
    subscription?.usage?.invitations?.used ??
    subscription?.usage?.monthlyInvites ??
    0
  );

  const remainingInvites =
    inviteLimit !== null ? Math.max(0, inviteLimit - inviteUsed) : null;

  const isInviteLimitReached = remainingInvites !== null && remainingInvites <= 0;

  // Extract unique candidate quotas
  const rawCandidateLimit =
    subscription?.effectiveLimits?.candidateLimit ??
    subscription?.usage?.candidates?.limit ??
    subscription?.limits?.totalCandidates ??
    null;

  const candidateLimit = rawCandidateLimit !== null && rawCandidateLimit !== undefined ? Number(rawCandidateLimit) : null;

  const candidateUsed = Number(
    subscription?.usage?.candidates?.used ??
    subscription?.usage?.totalCandidates ??
    0
  );

  const remainingCandidates =
    candidateLimit !== null ? Math.max(0, candidateLimit - candidateUsed) : null;

  const isCandidateLimitReached = remainingCandidates !== null && remainingCandidates <= 0;

  const planName =
    subscription?.planName ||
    subscription?.plan ||
    subscription?.company?.plan ||
    "Standard Plan";

  return {
    ...query,
    subscription,
    planName,
    inviteLimit,
    inviteUsed,
    remainingInvites,
    isInviteLimitReached,
    candidateLimit,
    candidateUsed,
    remainingCandidates,
    isCandidateLimitReached,
  };
}

