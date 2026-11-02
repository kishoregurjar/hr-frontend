"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import useSocketStore from "@/store/useSocketStore";
import { useAuth } from "@/features/auth/context/AuthContext";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "@/lib/api/notifications";

export const NOTIFICATION_QUERY_KEYS = {
  LIST: (filter) => ["notifications", filter || "all"],
  UNREAD_COUNT: ["notifications", "unread-count"],
};

export function useNotifications(filter = "all") {
  const queryClient = useQueryClient();
  const { socket, isConnected } = useSocketStore();
  const { isAuthenticated } = useAuth();

  // 1. Fetch unread count (Redis-cached)
  const { data: unreadCount = 0 } = useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.UNREAD_COUNT,
    queryFn: getUnreadNotificationCount,
    enabled: isAuthenticated,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
  });

  // 2. Fetch notifications list
  const isReadFilter = filter === "unread" ? false : undefined;
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.LIST(filter),
    queryFn: () => getNotifications({ isRead: isReadFilter, limit: 25 }),
    enabled: isAuthenticated,
    staleTime: 30 * 1000, // 30 seconds
  });

  const notifications = data?.notifications || [];
  const pagination = data?.pagination || {};

  // 3. Mark single as read mutation (Optimistic)
  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: (_res, id) => {
      queryClient.setQueryData(NOTIFICATION_QUERY_KEYS.UNREAD_COUNT, (prev) =>
        Math.max(0, (prev || 1) - 1)
      );
      queryClient.setQueriesData(
        { queryKey: ["notifications"] },
        (old) => {
          if (!old?.notifications) return old;
          return {
            ...old,
            notifications: old.notifications.map((n) =>
              n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
            ),
          };
        }
      );
    },
  });

  // 4. Mark all as read mutation (Optimistic)
  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.setQueryData(NOTIFICATION_QUERY_KEYS.UNREAD_COUNT, 0);
      queryClient.setQueriesData(
        { queryKey: ["notifications"] },
        (old) => {
          if (!old?.notifications) return old;
          return {
            ...old,
            notifications: old.notifications.map((n) => ({
              ...n,
              isRead: true,
              readAt: new Date().toISOString(),
            })),
          };
        }
      );
    },
  });

  // 5. Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: (_res, id) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // 6. Real-Time WebSockets Listener (Zero DB Polling)
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewNotification = (data) => {
      const newNotif = data?.notification || data;
      if (!newNotif) return;

      // Update unread count immediately in cache
      queryClient.setQueryData(NOTIFICATION_QUERY_KEYS.UNREAD_COUNT, (prev) => (prev || 0) + 1);

      // Prepend to notifications list
      queryClient.setQueriesData(
        { queryKey: ["notifications"] },
        (old) => {
          if (!old?.notifications) return old;
          return {
            ...old,
            notifications: [newNotif, ...old.notifications],
          };
        }
      );

      // Show real-time informative toast popup
      toast.info(newNotif.title, {
        description: newNotif.message,
        duration: 5000,
      });

      // Invalidate notifications queries to ensure full sync across all active views
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    };

    socket.on("NEW_NOTIFICATION", handleNewNotification);

    return () => {
      socket.off("NEW_NOTIFICATION", handleNewNotification);
    };
  }, [socket, isConnected, queryClient]);

  return {
    notifications,
    pagination,
    unreadCount,
    isLoading,
    isError,
    refetch,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteMutation.mutate,
    isMarkingAll: markAllAsReadMutation.isPending,
  };
}

