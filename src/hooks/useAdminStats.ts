"use client";

import { useQuery } from "@tanstack/react-query";

import { getAdminStats } from "@/services/admin.service";

export const useAdminStats = () => {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: getAdminStats,
    retry: false,
    placeholderData: (previousData) => previousData,
    staleTime: 10 * 1000,
    refetchInterval: 30 * 1000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};
