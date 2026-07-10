"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { connectRealtimeSocket } from "@/services/realtime.service";

const RealtimeBridge = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = connectRealtimeSocket();
    const refreshProducts = () => { queryClient.invalidateQueries({ queryKey: ["products"] }); queryClient.invalidateQueries({ queryKey: ["product"] }); queryClient.invalidateQueries({ queryKey: ["admin", "stats"] }); };
    const refreshCategories = () => { queryClient.invalidateQueries({ queryKey: ["categories"] }); queryClient.invalidateQueries({ queryKey: ["products"] }); queryClient.invalidateQueries({ queryKey: ["admin", "stats"] }); };
    const refreshOrders = () => { queryClient.invalidateQueries({ queryKey: ["orders"] }); queryClient.invalidateQueries({ queryKey: ["admin", "stats"] }); queryClient.invalidateQueries({ queryKey: ["products"] }); };
    const refreshDashboard = () => queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    const refreshContent = () => { queryClient.invalidateQueries({ queryKey: ["admin", "articles"] }); queryClient.invalidateQueries({ queryKey: ["settings"] }); };
    const refreshEverything = () => queryClient.invalidateQueries();

    socket.on("products:changed", refreshProducts);
    socket.on("categories:changed", refreshCategories);
    socket.on("orders:changed", refreshOrders);
    socket.on("dashboard:changed", refreshDashboard);
    socket.on("articles:changed", refreshContent);
    socket.on("blogs:changed", refreshContent);
    socket.on("settings:changed", refreshContent);
    socket.onAny(refreshEverything);

    return () => {
      socket.off("products:changed", refreshProducts);
      socket.off("categories:changed", refreshCategories);
      socket.off("orders:changed", refreshOrders);
      socket.off("dashboard:changed", refreshDashboard);
      socket.off("articles:changed", refreshContent);
      socket.off("blogs:changed", refreshContent);
      socket.off("settings:changed", refreshContent);
      socket.offAny(refreshEverything);
    };
  }, [queryClient]);

  return null;
};

export default RealtimeBridge;
