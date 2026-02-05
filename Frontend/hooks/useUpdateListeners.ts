import { useEffect } from 'react';
import { useSocket } from '@/components/SocketProvider';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { Board, Card } from '@/types/board';
import { ReorderCard } from '@/types/board';

export const useUpdateListeners = (boardId: string | null) => {
    const { socket, isConnected } = useSocket();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!socket || !isConnected || !boardId) return;

        const handleAddCard = ({columnId, card}: {columnId: string, card: Card}) => {
            queryClient.setQueryData(queryKeys.board(boardId), (old: any) => {
                if (!old) return old;
                
                return {
                    ...old,
                    columns: old.columns.map((col: any) =>
                    col.id === columnId
                        ? { ...col, cards: [...col.cards, card] }
                        : col
                    )
                };
            });
        }

        const handleUpdateCard = (updatedCard: Card) => {
            queryClient.setQueryData(queryKeys.board(boardId), (old: any) => {
                if (!old) return old;
                
                return {
                    ...old,
                    columns: old.columns.map((col: any) => ({
                        ...col,
                        cards: col.cards.map((card: Card) =>
                            card.id === updatedCard.id ? updatedCard : card
                        )
                    }))
                };
            });
        }

        const handleDeleteCard = (cardId: string) => {
            queryClient.setQueryData(queryKeys.board(boardId), (old: any) => {
                if (!old) return old;
                
                return {
                    ...old,
                    columns: old.columns.map((col: any) => ({
                        ...col,
                        cards: col.cards.filter((card: Card) => card.id !== cardId)
                    }))
                };
            });
        }

        const handleReorderCards = (reorderData: ReorderCard) => {
            const board = queryClient.getQueryData(queryKeys.board(boardId)) as Board;
            if (!board) return;

            const { cardId, prevCardId, columnId } = reorderData;

            const newColumns = board.columns.map(col => ({
                ...col,
                cards: [...col.cards]
            }));

            const newBoardState = {
                ...board,
                columns: newColumns
            };

            const oldColumnIndex = newColumns.findIndex((container) => container.cards.find((card) => card.id === cardId));
            if (oldColumnIndex === undefined || oldColumnIndex === -1) return;

            const oldCardIndex = newColumns[oldColumnIndex].cards.findIndex(card => card.id === cardId);
            if (oldCardIndex === undefined || oldCardIndex === -1) return;

            const newColumnIndex = newColumns.findIndex((container) => container.id === columnId);
            if (newColumnIndex === undefined || newColumnIndex === -1) return;

            const prevCardIndex = prevCardId ? (newColumns[newColumnIndex].cards.findIndex(card => card.id === prevCardId) + 1) : 0;

            const [movedCard] = newColumns[oldColumnIndex].cards.splice(oldCardIndex, 1);
            newColumns[newColumnIndex].cards.splice(prevCardIndex, 0, movedCard);
                  
            queryClient.setQueryData(queryKeys.board(boardId), newBoardState);
            
        }

        socket.on('CARD_ADDED', handleAddCard);
        socket.on('CARD_UPDATED', handleUpdateCard);
        socket.on('CARD_DELETED', handleDeleteCard);
        socket.on('CARDS_REORDERED', handleReorderCards);

        return () => {
            socket.off('CARD_ADDED', handleAddCard);
            socket.off('CARD_UPDATED', handleUpdateCard);
            socket.off('CARD_DELETED', handleDeleteCard);
            socket.off('CARDS_REORDERED', handleReorderCards);
        }
    }, [socket, isConnected, boardId]);
};