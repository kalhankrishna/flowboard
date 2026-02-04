import { useCallback, useEffect, useState } from 'react';
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

type LockedCard = {
    cardId: string;
    userName: string;
}

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

export const useLockListeners = (boardId: string | null) => {
    const { socket, isConnected } = useSocket();
    const [lockedCards, setLockedCards] = useState(new Map<string, string>());

    useEffect(() => {
        if (!socket || !isConnected || !boardId) return;

        const handleCardLock = ( { cardId, userName }: LockedCard) => {
          setLockedCards(prev => new Map(prev).set(cardId, userName));
        }

        const handleCardUnlock = ( { cardId }: { cardId: string }) => {
            setLockedCards(prev => {
                const updated = new Map(prev);
                updated.delete(cardId);
                return updated;
            });
        }

        const handleInitLocks = (locks: LockedCard[]) => {
            const lockMap = new Map<string, string>();
            locks.forEach(lock => lockMap.set(lock.cardId, lock.userName));
            setLockedCards(lockMap);
        }

        socket.on('CARD_LOCKED', handleCardLock);
        socket.on('CARD_UNLOCKED', handleCardUnlock);
        socket.on('BOARD_LOCKS_INIT', handleInitLocks);

        return () => {
            setLockedCards(new Map<string, string>());
            socket.off('CARD_LOCKED', handleCardLock);
            socket.off('CARD_UNLOCKED', handleCardUnlock);
            socket.off('BOARD_LOCKS_INIT', handleInitLocks);
        }
    }, [socket, isConnected, boardId]);

    return lockedCards;
};