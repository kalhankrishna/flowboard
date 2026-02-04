import { useEffect, useState } from 'react';
import { useSocket } from '@/components/SocketProvider';

type OnlineUser = {
  userId: string;
  userName: string;
  socketId: string;
};

export const usePresence = (boardId: string | null) => {
  const { socket, isConnected } = useSocket();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  useEffect(() => {
    if (!socket || !isConnected || !boardId) return;

    const handleUserJoined = (users: OnlineUser[]) => {
      setOnlineUsers(users);
    };

    const handleUserLeft = (users: OnlineUser[]) => {
      setOnlineUsers(users);
    };

    socket.on('USER_JOINED', handleUserJoined);
    socket.on('USER_LEFT', handleUserLeft);

    return () => {
      setOnlineUsers([]);
      socket.off('USER_JOINED', handleUserJoined);
      socket.off('USER_LEFT', handleUserLeft);
    };
  }, [socket, isConnected, boardId]);

  return { onlineUsers };
};