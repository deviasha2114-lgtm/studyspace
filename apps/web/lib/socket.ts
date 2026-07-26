import { io, type Socket } from "socket.io-client";

/**
 * FLAG FOR ARCHITECT / BACKEND:
 * This creates the client only. No component should call getSocket()
 * until Backend confirms the real-time event contracts (event names,
 * payload shapes) it will emit/listen for.
 */

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

let socket: Socket | null = null;

export function getSocket(accessToken: string): Socket {
  if (socket) return socket;

  if (!SOCKET_URL && process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.warn(
      "NEXT_PUBLIC_SOCKET_URL is not set — socket connection will fail.",
    );
  }

  socket = io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
    auth: { token: accessToken },
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    transports: ["websocket", "polling"],
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
