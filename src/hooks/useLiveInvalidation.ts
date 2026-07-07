"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export const useLiveInvalidation = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const source = typeof window !== "undefined" ? window.EventSource : null;
    if (!source) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const baseUrl = apiUrl.replace(/\/api\/?$/, "");
    if (!baseUrl) return;

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
