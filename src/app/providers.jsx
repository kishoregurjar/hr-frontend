"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "@/features/auth/context";

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
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={3500}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default Providers;
