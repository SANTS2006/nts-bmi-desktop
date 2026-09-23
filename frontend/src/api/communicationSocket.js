import { io } from "socket.io-client";

const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin;

let socket = null;

export function getCommunicationSocket() {
  if (socket) return socket;

  socket = io(API_BASE_URL, {
    withCredentials: true,
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  return socket;
}

export function closeCommunicationSocket() {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
}
