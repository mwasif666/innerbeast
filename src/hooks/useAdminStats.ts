"use client";

import { useQuery } from "@tanstack/react-query";

import { getAdminStats } from "@/services/admin.service";

export const useAdminStats = () => {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: getAdminStats,
    retry: false,
  });
};
