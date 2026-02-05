import { useCallback } from 'react';
import { useSocket } from '@/components/SocketProvider';

type SuccessResponse = {
    success: true;
    cardId: string;
};

type ErrorResponse = {
    success: false;
    error: string;
};

type CardLockResponse = SuccessResponse | ErrorResponse;

type CardInBoard = {
    boardId: string;
    cardId: string;
};

export const useCardLock = () => {
    const { socket } = useSocket();

    const lockCard = useCallback(({boardId, cardId}: CardInBoard) => {
        if (!socket) return;
        
        socket.emit('CARD_LOCK', {boardId, cardId}, (response: CardLockResponse) => {
            if (!response.success) {
                console.error(response.error);
            }
        });
    }, [socket]);

    const unlockCard = useCallback(({boardId, cardId}: CardInBoard) => {
        if (!socket) return;
        
        socket.emit('CARD_UNLOCK', {boardId, cardId}, (response: CardLockResponse) => {
            if (!response.success) {
                console.error(response.error);
            }
        });
    }, [socket]);

    return { lockCard, unlockCard };
};