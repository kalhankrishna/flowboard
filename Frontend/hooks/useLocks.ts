import { useCallback } from 'react';
import { useSocket } from '@/components/SocketProvider';

type SuccessResponse = {
    success: true;
    resourceId: string;
};

type ErrorResponse = {
    success: false;
    error: string;
};

type CardLockResponse = SuccessResponse | ErrorResponse;

type CardInBoard = {
    boardId: string;
    resourceId: string;
};

export const useLock = () => {
    const { socket } = useSocket();

    const lockResource = useCallback(({boardId, resourceId}: CardInBoard) => {
        if (!socket) return;
        
        socket.emit('RESOURCE_LOCK', {boardId, resourceId}, (response: CardLockResponse) => {
            if (!response.success) {
                console.error(response.error);
            }
        });
    }, [socket]);

    const unlockResource = useCallback(({boardId, resourceId}: CardInBoard) => {
        if (!socket) return;
        
        socket.emit('RESOURCE_UNLOCK', {boardId, resourceId}, (response: CardLockResponse) => {
            if (!response.success) {
                console.error(response.error);
            }
        });
    }, [socket]);

    return { lockResource, unlockResource };
};