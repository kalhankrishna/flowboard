import { useEffect, useState } from 'react';
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
  const [isInRoom, setIsInRoom] = useState(false);
  const [roomError, setRoomError] = useState<string | null>(null);

  useEffect(() => {
    if (!socket || !isConnected || !boardId) {
      return;
    }

    socket.emit('BOARD_JOIN', boardId, (response: RoomJoinResponse) => {
        if (response.success) {
            setIsInRoom(true);
            setRoomError(null);
        } else {
            setIsInRoom(false);
            setRoomError(response.error);
        }
    });

    return () => {
        if (socket.connected) {
            socket.emit('BOARD_LEAVE', boardId);
        }
        setIsInRoom(false);
    };
  }, [socket, isConnected, boardId]);

  return {
    isInRoom,
    roomError,
  };
};