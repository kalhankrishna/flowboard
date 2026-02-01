import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export function useWebSockets() {
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);
  const { user } = useAuthStore();
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {

    const accessToken = localStorage.getItem('accessToken');

    if (!user || !accessToken) {
      if (socket) {
        socket.disconnect();
        socket = null;
        setIsConnected(false);
        setSocketId(null);
        tokenRef.current = null;
      }
      return;
    }

    // Reconnect if token changed on refresh
    if (socket && tokenRef.current !== accessToken) {
      console.log('Access token changed, reconnecting socket...');
      socket.disconnect();
      socket = null;
    }

    if (!socket) {
      const newSocket = socket = io(SOCKET_URL, {
        auth: {
          token: accessToken,
        },
        autoConnect: true,
      });

      socket = newSocket;

      tokenRef.current = accessToken;

      // Connection handlers
      socket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setIsConnected(true);
        setSocketId(newSocket.id ?? null);
      });

      socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setIsConnected(false);
        setSocketId(null);
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
        setIsConnected(false);
      });
    }

    // Cleanup
    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
        setIsConnected(false);
        setSocketId(null);
        tokenRef.current = null;
      }
    };
  }, [user]);

  return {
    socket,
    socketId,
    isConnected,
  };
};