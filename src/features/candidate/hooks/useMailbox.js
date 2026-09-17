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
    retry: 2,
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
      const msg = err?.response?.data?.message || err?.message || "Failed to initiate Google OAuth.";
      toast.error(msg);
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
      const count = res?.processedResumes ?? res?.newCandidatesCount ?? res?.count ?? 0;
      toast.success(
        count > 0
          ? `Synced & extracted ${count} candidate resume(s) from inbox!`
          : "Mailbox synced successfully! New resumes processed."
      );
      // Revalidate all related queries instantly
      queryClient.invalidateQueries({ queryKey: CANDIDATE_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardOverview"] });
      queryClient.invalidateQueries({ queryKey: MAILBOX_QUERY_KEY });
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err?.message || "Failed to sync mailbox.";
      toast.error(msg);
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
      queryClient.setQueryData(MAILBOX_QUERY_KEY, {
        connected: false,
        email: null,
        isSyncActive: false,
        lastSyncedAt: null,
      });
      queryClient.invalidateQueries({ queryKey: MAILBOX_QUERY_KEY });
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err?.message || "Failed to disconnect mailbox.";
      toast.error(msg);
    },
  });
};
