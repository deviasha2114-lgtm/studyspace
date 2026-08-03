import { Socket } from 'socket.io-client';

let socket: Socket | null = null;

/**
 * Initialize socket connection with token
 * @param token - JWT token for authentication
 * @returns Socket instance
 */
export const getSocket = (token: string): Socket => {
  if (!socket) {
    // Import here to prevent client-side bundle issues
    const { io } = require('socket.io-client');

    // Get the base URL from environment or use relative URL
    const baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL ||
                   (typeof window !== 'undefined' ? window.location.origin : '');

    socket = io(baseUrl, {
      auth: {
        token
      },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    // Set up event listeners
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  return socket;
};

/**
 * Disconnect socket connection
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default { getSocket, disconnectSocket };