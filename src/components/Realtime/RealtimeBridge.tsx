"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocketUrl } from "@/config/site";
import { connectRealtimeSocket } from "@/services/realtime.service";

const RealtimeBridge = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = connectRealtimeSocket();
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

    const refreshDashboard = () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    };

    const knownRealtimeEvents = new Set([
      "products:changed",
      "categories:changed",
      "orders:changed",
      "dashboard:changed",
    ]);

    const refreshEverything = (eventName: string) => {
      if (knownRealtimeEvents.has(eventName)) return;
      queryClient.invalidateQueries();
    };

    socket.on("products:changed", refreshProducts);
    socket.on("categories:changed", refreshCategories);
    socket.on("orders:changed", refreshOrders);
    socket.on("dashboard:changed", refreshDashboard);
    socket.onAny(refreshEverything);

    const EventSourceConstructor =
      typeof window !== "undefined" ? window.EventSource : null;
    const events = EventSourceConstructor
      ? new EventSourceConstructor(`${getSocketUrl()}/api/realtime/stream`, {
          withCredentials: true,
        })
      : null;

    events?.addEventListener("products:changed", refreshProducts);
    events?.addEventListener("categories:changed", refreshCategories);
    events?.addEventListener("orders:changed", refreshOrders);
    events?.addEventListener("dashboard:changed", refreshDashboard);

    return () => {
      socket.off("products:changed", refreshProducts);
      socket.off("categories:changed", refreshCategories);
      socket.off("orders:changed", refreshOrders);
      socket.off("dashboard:changed", refreshDashboard);
      socket.offAny(refreshEverything);
      events?.close();
    };
  }, [queryClient]);

  return null;
};

export default RealtimeBridge;
