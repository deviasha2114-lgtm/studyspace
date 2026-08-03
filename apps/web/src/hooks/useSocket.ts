import { useEffect, useCallback, useRef, RefObject } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getSocket, disconnectSocket } from '@/lib/socket';
import type { Socket } from 'socket.io-client';

export const useSocket = () => {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const isInitialized = useRef(false);

  // Initialize socket connection
  const initializeSocket = useCallback(() => {
    if (!user || isInitialized.current) return;

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        console.warn('No auth token found for socket connection');
        return;
      }

      socketRef.current = getSocket(token);
      socketRef.current.connect();
      isInitialized.current = true;
    } catch (error) {
      console.error('Failed to initialize socket:', error);
    }
  }, [user]);

  // Disconnect socket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      disconnectSocket();
      socketRef.current = null;
      isInitialized.current = false;
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeSocket();
    return () => {
      disconnect();
    };
  }, [initializeSocket, disconnect]);

  // Return socket instance and control functions
  const getSocketInstance = useCallback(() => {
    return socketRef.current;
  }, []);

  return {
    socket: socketRef.current,
    connect: initializeSocket,
    disconnect,
    getSocket: getSocketInstance
  };
};

export default useSocket;