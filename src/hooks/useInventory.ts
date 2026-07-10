"use client";

import { useQuery } from "@tanstack/react-query";
import { getLowStockProducts } from "@/services/inventory.service";

export const useLowStockProducts = (threshold = 5) => {
  return useQuery({
    queryKey: ["inventory", threshold],
    queryFn: () => getLowStockProducts(threshold),
    retry: false,
    staleTime: 30000,
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
  });
};
