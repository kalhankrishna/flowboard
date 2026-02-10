import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useSocket } from '@/components/SocketProvider';
import { BoardRole } from '@/types/share';

type SuccessResponse = {
  success: true;
  boardId: string;
  role: BoardRole;
};

type ErrorResponse = {
  success: false;
  error: string;
};

type RoomJoinResponse = SuccessResponse | ErrorResponse;

export const useBoardRoom = (boardId: string | null) => {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected || !boardId) return;
    
    let cancelled = false;

    socket.emit('BOARD_JOIN', boardId, (response: RoomJoinResponse) => {
      if(cancelled) return;

      if (!response.success) {
        toast.error("Failed to join board room");
      }
    });

    return () => {
      cancelled = true;
      if (socket.connected) {
        socket.emit('BOARD_LEAVE', boardId);
      }
    };
  }, [socket, isConnected, boardId]);
};