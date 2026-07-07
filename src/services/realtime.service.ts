import { io } from "socket.io-client";

export const getRealtimeUrl = () => {
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
  if (socketUrl) return socketUrl;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  return apiUrl.replace("/api", "");
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
