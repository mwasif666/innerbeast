"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import RealtimeBridge from "@/components/Realtime/RealtimeBridge";
import type { StoreSettingsResponse } from "@/services/settings.service";

type ReactQueryProviderProps = {
  children: ReactNode;
  initialSettings?: StoreSettingsResponse;
};

const ReactQueryProvider = ({ children, initialSettings }: ReactQueryProviderProps) => {
  const [queryClient] = useState(
    () => {
      const client = new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 30 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
          },
        },
      });

      if (initialSettings) {
        client.setQueryData(["settings", "public"], initialSettings);
      }

      return client;
    },
  );

  return (
    <QueryClientProvider client={queryClient}>
      <RealtimeBridge />
      {children}
    </QueryClientProvider>
  );
};

export default ReactQueryProvider;
