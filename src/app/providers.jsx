"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, Loader2 } from "lucide-react";
import { AuthProvider } from "@/features/auth/context";
import { SocketProvider } from "../providers/SocketProvider";

const Providers = ({ children }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes cache
            gcTime: 10 * 60 * 1000,    // 10 minutes garbage collection
            refetchOnWindowFocus: false, // Freeze repetitive tab focus API calls
            refetchOnMount: false,       // Use cached data on mount if fresh
            refetchOnReconnect: false,   // Don't spam APIs on network reconnect
            retry: 1,                    // Only retry once on failure
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          {children}
          <Toaster
            position="top-right"
            expand={true}
          closeButton
          duration={4000}
          theme="dark"
          icons={{
            success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
            error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
            warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
            info: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
            loading: <Loader2 className="w-5 h-5 text-indigo-400 animate-spin shrink-0" />,
          }}
          toastOptions={{
            className: "hirequest-toast",
            classNames: {
              toast: "hirequest-toast",
              title: "hirequest-toast-title",
              description: "hirequest-toast-description",
              closeButton: "hirequest-toast-close",
            },
          }}
        />
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default Providers;
