"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getMailboxStatus,
  getGoogleConnectUrl,
  syncMailboxNow,
  disconnectMailbox,
} from "@/lib/api/mailbox";
import { CANDIDATE_QUERY_KEYS } from "../constants";

export const MAILBOX_QUERY_KEY = ["mailbox", "status"];

/**
 * 1. Hook to check mailbox connection status
 */
export const useMailboxStatus = () => {
  return useQuery({
    queryKey: MAILBOX_QUERY_KEY,
    queryFn: getMailboxStatus,
    staleTime: 10000,
    refetchOnWindowFocus: true,
  });
};

/**
 * 2. Hook to trigger Google OAuth connect URL
 */
export const useConnectGoogleMailbox = () => {
  return useMutation({
    mutationFn: getGoogleConnectUrl,
    onSuccess: (data) => {
      const url = data?.url;
      if (url) {
        window.location.href = url;
      } else {
        toast.error("Failed to generate Google connection URL.");
      }
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to initiate Google OAuth.");
    },
  });
};

/**
 * 3. Hook to manually sync mailbox
 */
export const useSyncMailboxNow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncMailboxNow,
    onSuccess: (res) => {
      const count = res?.processedResumes ?? res?.newCandidatesCount ?? 0;
      toast.success(`Processed ${count} candidate resume(s) from inbox!`);
      queryClient.invalidateQueries({ queryKey: CANDIDATE_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: MAILBOX_QUERY_KEY });
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to sync mailbox.");
    },
  });
};

/**
 * 4. Hook to disconnect mailbox
 */
export const useDisconnectMailbox = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: disconnectMailbox,
    onSuccess: () => {
      toast.info("Google Mailbox disconnected.");
      queryClient.invalidateQueries({ queryKey: MAILBOX_QUERY_KEY });
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to disconnect mailbox.");
    },
  });
};
