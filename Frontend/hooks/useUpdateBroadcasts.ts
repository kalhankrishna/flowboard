import { useCallback } from 'react';
import { useSocket } from '@/components/SocketProvider';
import { Card, ReorderCard } from '@/types/board';

type SuccessResponse = {
  success: true;
  resourceId: string;
};

type ErrorResponse = {
  success: false;
  error: string;
};

type UpdateResponse = SuccessResponse | ErrorResponse;

export const useUpdateBroadcasts = () => {
    const { socket } = useSocket();

    const addCardBroadcast = useCallback(({boardId, card}: {boardId: string, card: Card}) => {
        if (!socket) return;
        
        socket.emit('ADD_CARD', {boardId, card}, (response: UpdateResponse) => {
            if (!response.success) {
                console.error(response.error);
            }
        });
    }, [socket]);

    const updateCardBroadcast = useCallback(({boardId, card}: {boardId: string, card: Card}) => {
        if (!socket) return;
        
        socket.emit('UPDATE_CARD', {boardId, card}, (response: UpdateResponse) => {
            if (!response.success) {
                console.error(response.error);
            }
        });
    }, [socket]);

    const deleteCardBroadcast = useCallback(({boardId, cardId}: {boardId: string, cardId: string}) => {
        if (!socket) return;
        
        socket.emit('DELETE_CARD', {boardId, cardId}, (response: UpdateResponse) => {
            if (!response.success) {
                console.error(response.error);
            }
        });
    }, [socket]);

    const reorderCardsBroadcast = useCallback(({boardId, reorderData}: {boardId: string, reorderData: ReorderCard}) => {
        if (!socket) return;
        
        socket.emit('REORDER_CARDS', {boardId, reorderData}, (response: UpdateResponse) => {
            if (!response.success) {
                console.error(response.error);
            }
        });
    }, [socket]);

    return { addCardBroadcast, updateCardBroadcast, deleteCardBroadcast, reorderCardsBroadcast};
};