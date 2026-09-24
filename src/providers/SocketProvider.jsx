"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import useSocketStore from "../store/useSocketStore";
import { useAuth } from "@/features/auth/context/AuthContext";
import { RESULT_QUERY_KEYS } from "../features/result/constants";
import { CANDIDATE_QUERY_KEYS } from "../features/candidate/constants";
import { HIRING_QUERY_KEYS } from "../features/hiring/constants";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://walkingdreamzhrmanagement.up.railway.app";

export function SocketProvider({ children }) {
  const queryClient = useQueryClient();
  const { setSocket, setConnected } = useSocketStore();

  const { token: accessToken, isAuthenticated } = useAuth();

  useEffect(() => {
    const tokenToUse =
      accessToken ||
      (typeof window !== "undefined"
        ? localStorage.getItem("hirequest_token") ||
          localStorage.getItem("token") ||
          localStorage.getItem("accessToken") ||
          localStorage.getItem("jwt")
        : null);

    const socketInstance = io(SOCKET_URL, {
      auth: {
        token: tokenToUse || "",
      },
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socketInstance.on("connect", () => {
      setConnected(true);
      setSocket(socketInstance);
    });

    socketInstance.on("disconnect", () => {
      setConnected(false);
    });

    // ==========================================
    // Event Listeners
    // ==========================================

    socketInstance.on("GAME_STATUS_UPDATED", () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
    });

    socketInstance.on("ATTEMPT_STARTED", (data) => {
      // Refresh assessment results table
      if (data?.assessmentId) {
        queryClient.invalidateQueries({ queryKey: RESULT_QUERY_KEYS?.assessment ? RESULT_QUERY_KEYS.assessment(data.assessmentId) : ["results", data.assessmentId] });
      }
    });

    socketInstance.on("ASSESSMENT_SUBMITTED", (data) => {
      if (data?.assessmentId) {
        queryClient.invalidateQueries({ queryKey: RESULT_QUERY_KEYS?.assessment ? RESULT_QUERY_KEYS.assessment(data.assessmentId) : ["results", data.assessmentId] });
      }
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    });

    socketInstance.on("NEW_JOB_APPLICATION", (data) => {
      if (data?.jobId) {
        queryClient.invalidateQueries({ queryKey: HIRING_QUERY_KEYS?.candidates ? HIRING_QUERY_KEYS.candidates(data.jobId) : ["hiring", "candidates", data.jobId] });
      }
    });

    return () => {
      socketInstance.off("connect");
      socketInstance.off("disconnect");
      socketInstance.off("GAME_STATUS_UPDATED");
      socketInstance.off("ATTEMPT_STARTED");
      socketInstance.off("ASSESSMENT_SUBMITTED");
      socketInstance.off("NEW_JOB_APPLICATION");
      socketInstance.disconnect();
    };
  }, [accessToken, isAuthenticated, queryClient, setSocket, setConnected]);

  return <>{children}</>;
}
