import { io } from "socket.io-client";
import { getSocketUrl } from "@/config/site";

export const getRealtimeUrl = () => {
  return getSocketUrl();
};

export const realtimeSocket = io(getRealtimeUrl(), {
  path: "/socket.io",
  autoConnect: false,
  withCredentials: true,
});

export const connectRealtimeSocket = () => {
  if (!realtimeSocket.connected) realtimeSocket.connect();
  return realtimeSocket;
};

export const disconnectRealtimeSocket = () => {
  if (realtimeSocket.connected) realtimeSocket.disconnect();
};
