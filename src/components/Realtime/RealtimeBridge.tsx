"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { connectRealtimeSocket } from "@/services/realtime.service";

const RealtimeBridge = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = connectRealtimeSocket();
    const syncData = () => queryClient.refetchQueries();

    socket.onAny(syncData);

    return () => {
      socket.offAny(syncData);
    };
  }, [queryClient]);

  return null;
};

export default RealtimeBridge;
