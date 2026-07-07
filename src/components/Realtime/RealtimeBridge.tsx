"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { connectRealtimeSocket } from "@/services/realtime.service";

const RealtimeBridge = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = connectRealtimeSocket();
    const syncData = () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    };

    socket.on("realtime:connected", syncData);

    return () => {
      socket.off("realtime:connected", syncData);
    };
  }, [queryClient]);

  return null;
};

export default RealtimeBridge;
