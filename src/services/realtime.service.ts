import { io } from "socket.io-client";
import { getSocketUrl } from "@/config/site";

export const getRealtimeUrl = () => {
  return getSocketUrl();
};

export const realtimeSocket = io(getRealtimeUrl(), {
  path: "/socket.io",
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket"],
  reconnectionAttempts: 5,
  timeout: 10000,
});

export const connectRealtimeSocket = () => {
  if (!realtimeSocket.connected) realtimeSocket.connect();
  return realtimeSocket;
};

export const disconnectRealtimeSocket = () => {
  if (realtimeSocket.connected) realtimeSocket.disconnect();
};
