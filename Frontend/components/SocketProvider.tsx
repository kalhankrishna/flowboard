'use client';

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  socketId: string | null;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  socketId: null,
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);
  const { user } = useAuthStore();
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');

    if (!user || !accessToken) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
        setSocketId(null);
        tokenRef.current = null;
      }
      return;
    }

    if (socket && tokenRef.current !== accessToken) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setSocketId(null);
    }

    if (!socket) {
      
      const newSocket = io(SOCKET_URL, {
        auth: { token: accessToken },
        autoConnect: true,
      });

      tokenRef.current = accessToken;

      newSocket.on('connect', () => {
        setIsConnected(true);
        setSocketId(newSocket.id ?? null);
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        setSocketId(null);
      });

      newSocket.on('connect_error', () => {
        setIsConnected(false);
      });

      setSocket(newSocket);
    }

  }, [user, socket]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, socketId }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};