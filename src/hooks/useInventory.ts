"use client";

import { useQuery } from "@tanstack/react-query";
import { getInventoryProducts, getLowStockProducts } from "@/services/inventory.service";

export const useLowStockProducts = (threshold = 5) => {
  return useQuery({
    queryKey: ["inventory", "low-stock", threshold],
    queryFn: () => getLowStockProducts(threshold),
    retry: false,
    staleTime: 30000,
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
  });
};

export const useInventoryProducts = () => {
  return useQuery({
    queryKey: ["inventory", "all"],
    queryFn: getInventoryProducts,
    retry: false,
    staleTime: 30000,
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
  });
};
