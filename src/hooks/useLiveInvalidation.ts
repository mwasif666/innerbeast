"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocketUrl } from "@/config/site";

export const useLiveInvalidation = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const source = typeof window !== "undefined" ? window.EventSource : null;
    if (!source) return;

    const baseUrl = getSocketUrl();

    const events = new source(`${baseUrl}/api/realtime/stream`, {
      withCredentials: true,
    });

    const refreshProducts = () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    };

    const refreshCategories = () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    };

    const refreshOrders = () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    };

    events.addEventListener("products:changed", refreshProducts);
    events.addEventListener("categories:changed", refreshCategories);
    events.addEventListener("orders:changed", refreshOrders);
    events.addEventListener("dashboard:changed", () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    });

    return () => {
      events.close();
    };
  }, [queryClient]);
};
