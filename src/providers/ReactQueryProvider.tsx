"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
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
            retry: 1,
            refetchOnWindowFocus: false,
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
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default ReactQueryProvider;
