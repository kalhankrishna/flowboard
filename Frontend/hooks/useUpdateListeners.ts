import { useEffect } from 'react';
import { useSocket } from '@/components/SocketProvider';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { Board, Card, Column, ReorderCard, ReorderColumn } from '@/types/board';

export const useUpdateListeners = (boardId: string | null) => {
    const { socket, isConnected } = useSocket();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!socket || !isConnected || !boardId) return;

        const handleAddCard = async ({columnId, card}: {columnId: string, card: Card}) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.board(boardId) });
            queryClient.setQueryData(queryKeys.board(boardId), (old: Board | undefined) => {
                if (!old) return old;
                
                return {
                    ...old,
                    columns: old.columns.map((col: Column) =>
                    col.id === columnId
                        ? { ...col, cards: [...col.cards, card] }
                        : col
                    )
                };
            });
        }

        const handleUpdateCard = async (updatedCard: Card) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.board(boardId) });
            queryClient.setQueryData(queryKeys.board(boardId), (old: Board | undefined) => {
                if (!old) return old;
                
                return {
                    ...old,
                    columns: old.columns.map((col: Column) => ({
                        ...col,
                        cards: col.cards.map((card: Card) =>
                            card.id === updatedCard.id ? updatedCard : card
                        )
                    }))
                };
            });
        }

        const handleDeleteCard = async (cardId: string) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.board(boardId) });
            queryClient.setQueryData(queryKeys.board(boardId), (old: Board | undefined) => {
                if (!old) return old;
                
                return {
                    ...old,
                    columns: old.columns.map((col: Column) => ({
                        ...col,
                        cards: col.cards.filter((card: Card) => card.id !== cardId)
                    }))
                };
            });
        }

        const handleReorderCards = async (reorderData: ReorderCard) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.board(boardId) });
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

            const [movedCard] = newColumns[oldColumnIndex].cards.splice(oldCardIndex, 1);
            const prevCardIndex = prevCardId ? (newColumns[newColumnIndex].cards.findIndex(card => card.id === prevCardId) + 1) : 0;
            newColumns[newColumnIndex].cards.splice(prevCardIndex, 0, movedCard);
                    
            queryClient.setQueryData(queryKeys.board(boardId), newBoardState);  
        }

        const handleAddColumn = async (column: Column) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.board(boardId) });
            queryClient.setQueryData(queryKeys.board(boardId), (old: Board | undefined) => {
                if (!old) return old;
                
                return {
                    ...old,
                    columns: [...old.columns, { ...column, cards: [] }]
                };
            });
        }

        const handleUpdateColumn = async (updatedColumn: Column) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.board(boardId) });
            queryClient.setQueryData(queryKeys.board(boardId), (old: Board | undefined) => {
                if (!old) return old;
                
                return {
                    ...old,
                    columns: old.columns.map((col: Column) => 
                        col.id === updatedColumn.id
                        ? { ...col, title: updatedColumn.title, position: updatedColumn.position }
                        : col
                    )
                };
            });
        }

        const handleDeleteColumn = async (columnId: string) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.board(boardId) });
            queryClient.setQueryData(queryKeys.board(boardId), (old: Board | undefined) => {
                if (!old) return old;
                
                return {
                    ...old,
                    columns: old.columns.filter((col: Column) => col.id !== columnId)
                };
            });
        }

        const handleReorderColumns = async (reorderData: ReorderColumn) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.board(boardId) });
            const board = queryClient.getQueryData(queryKeys.board(boardId)) as Board;
            if (!board) return;

            const { columnId, prevColumnId } = reorderData;

            const newColumns = board.columns.map(col => ({
                ...col,
                cards: [...col.cards]
            }));

            const newBoardState = {
                ...board,
                columns: newColumns
            };

            const oldColumnIndex = newColumns.findIndex((col: Column) => col.id === columnId);
            if (oldColumnIndex === undefined || oldColumnIndex === -1) return;

            const [movedColumn] = newColumns.splice(oldColumnIndex, 1);
            const prevColumnIndex = prevColumnId ? (newColumns.findIndex((col: Column) => col.id === prevColumnId) + 1) : 0;
            newColumns.splice(prevColumnIndex, 0, movedColumn);
                    
            queryClient.setQueryData(queryKeys.board(boardId), newBoardState);  
        }

        socket.on('CARD_ADDED', handleAddCard);
        socket.on('CARD_UPDATED', handleUpdateCard);
        socket.on('CARD_DELETED', handleDeleteCard);
        socket.on('CARDS_REORDERED', handleReorderCards);
        socket.on('COLUMN_ADDED', handleAddColumn);
        socket.on('COLUMN_UPDATED', handleUpdateColumn);
        socket.on('COLUMN_DELETED', handleDeleteColumn);
        socket.on('COLUMNS_REORDERED', handleReorderColumns);

        return () => {
            socket.off('CARD_ADDED', handleAddCard);
            socket.off('CARD_UPDATED', handleUpdateCard);
            socket.off('CARD_DELETED', handleDeleteCard);
            socket.off('CARDS_REORDERED', handleReorderCards);
            socket.off('COLUMN_ADDED', handleAddColumn);
            socket.off('COLUMN_UPDATED', handleUpdateColumn);
            socket.off('COLUMN_DELETED', handleDeleteColumn);
            socket.off('COLUMNS_REORDERED', handleReorderColumns);
        }
    }, [socket, isConnected, boardId, queryClient]);
};