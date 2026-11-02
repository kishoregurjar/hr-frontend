"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateCompanyProfile,
  uploadCompanyLogo,
  sendMemberInvitation,
  revokeInvitation,
  updateMemberRole,
  deactivateMember,
  reactivateMember,
  removeMember,
  transferOwnership,
} from "@/lib/api/company";
import { COMPANY_QUERY_KEYS } from "../constants";

/**
 * Mutation: Update company profile details
 */
export function useUpdateCompanyProfileMutation(companyId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => updateCompanyProfile(data),
    onSuccess: (updatedData) => {
      if (updatedData) {
        queryClient.setQueryData(
          COMPANY_QUERY_KEYS.profile(companyId),
          (prev) => (prev ? { ...prev, ...updatedData } : updatedData)
        );
      }
      queryClient.invalidateQueries({
        queryKey: COMPANY_QUERY_KEYS.profile(companyId),
      });
    },
  });
}

/**
 * Mutation: Upload company logo
 */
export function useUploadCompanyLogoMutation(companyId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file) => uploadCompanyLogo(file),
    onSuccess: (res) => {
      const newLogoUrl = res?.logoUrl || res?.company?.logoUrl || res?.url;
      if (newLogoUrl) {
        queryClient.setQueryData(
          COMPANY_QUERY_KEYS.profile(companyId),
          (prev) => (prev ? { ...prev, logoUrl: newLogoUrl, logo: newLogoUrl } : prev)
        );
      }
      queryClient.invalidateQueries({
        queryKey: COMPANY_QUERY_KEYS.profile(companyId),
      });
    },
  });
}

/**
 * Mutation: Send team member invitation
 */
export function useSendMemberInvitationMutation(companyId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, role }) => sendMemberInvitation({ email, role }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["company", "invitations", String(companyId || "default")],
      });
    },
  });
}

/**
 * Mutation: Revoke pending invitation
 */
export function useRevokeInvitationMutation(companyId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId) => revokeInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["company", "invitations", String(companyId || "default")],
      });
    },
  });
}

/**
 * Mutation: Update member role
 */
export function useUpdateMemberRoleMutation(companyId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, role }) => updateMemberRole(memberId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["company", "members", String(companyId || "default")],
      });
    },
  });
}

/**
 * Mutation: Deactivate member
 */
export function useDeactivateMemberMutation(companyId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId) => deactivateMember(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["company", "members", String(companyId || "default")],
      });
    },
  });
}

/**
 * Mutation: Reactivate member
 */
export function useReactivateMemberMutation(companyId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId) => reactivateMember(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["company", "members", String(companyId || "default")],
      });
    },
  });
}

/**
 * Mutation: Remove member
 */
export function useRemoveMemberMutation(companyId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId) => removeMember(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["company", "members", String(companyId || "default")],
      });
    },
  });
}

/**
 * Mutation: Transfer ownership
 */
export function useTransferOwnershipMutation(companyId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId) => transferOwnership(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["company", "members", String(companyId || "default")],
      });
      queryClient.invalidateQueries({
        queryKey: COMPANY_QUERY_KEYS.profile(companyId),
      });
    },
  });
}

