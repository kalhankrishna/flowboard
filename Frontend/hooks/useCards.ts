import { useRef, useCallback, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addCard, updateCard, deleteCard, reorderCards } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { Card, ReorderCards } from '@/types/board';
import toast from 'react-hot-toast';

export function useCards(boardId: string) {
  const queryClient = useQueryClient();
  const reorderTimeout = useRef<NodeJS.Timeout | null>(null);
  const pendingReorder = useRef<ReorderCards[] | null>(null);
  
  //ADD CARD
  const addCardMutation = useMutation({
    mutationFn: (params: { columnId: string; title: string; description: string | null; position: number }) =>
      addCard(params.columnId, params.title, params.description, params.position),
    
    onSuccess: (newCard, variables) => {
      queryClient.setQueryData(queryKeys.board(boardId), (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          columns: old.columns.map((col: any) =>
            col.id === variables.columnId
              ? { ...col, cards: [...col.cards, newCard] }
              : col
          )
        };
      });
      toast.success('Card added successfully');
    },
    
    onError: (error) => {
      console.error('Failed to add card:', error);
      toast.error('Failed to add card');
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) });
    }
  });
  
  //UPDATE CARD
  const updateCardMutation = useMutation({
    mutationFn: (params: { id: string; title: string; description: string | null; position: number }) =>
      updateCard(params.id, params.title, params.description, params.position),
    
    onSuccess: (updatedCard) => {
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
      toast.success('Card updated successfully');
    },
    
    onError: (error) => {
      console.error('Failed to update card:', error);
      toast.error('Failed to update card');
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) });
    }
  });
  
  //DELETE CARD
  const deleteCardMutation = useMutation({
    mutationFn: (cardId: string) => deleteCard(cardId),
    
    onMutate: async (cardId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.board(boardId) });
      
      const previous = queryClient.getQueryData(queryKeys.board(boardId));
      
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
      
      return { previous };
    },

    onSuccess: () => {
      toast.success('Card deleted successfully');
    },
    
    onError: (error, variables, context) => {
      console.error('Failed to delete card:', error);
      toast.error('Failed to delete card');
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.board(boardId), context.previous);
      }
    }
  });
  
  //REORDER CARDS (DEBOUNCED)
  const reorderCardsMutation = useMutation({
    mutationFn: (columns: ReorderCards[]) => reorderCards(columns),
    
    onError: (error) => {
      console.error('Failed to reorder cards:', error);
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) });
    }
  });
  

  const handleReorderCards = useCallback((newBoardState: any, affectedColumns: ReorderCards[]) => {
    queryClient.setQueryData(queryKeys.board(boardId), newBoardState);

    if (reorderTimeout.current) {
      clearTimeout(reorderTimeout.current);
    }

    pendingReorder.current = affectedColumns;
    
    reorderTimeout.current = setTimeout(() => {
      reorderCardsMutation.mutate(affectedColumns);
      pendingReorder.current = null;
    }, 300);
  }, [boardId, queryClient, reorderCardsMutation]);
  
  useEffect(() => {
    return () => {
      if (reorderTimeout.current) {
        clearTimeout(reorderTimeout.current);
      }
      if(pendingReorder.current) {
        reorderCardsMutation.mutate(pendingReorder.current);
      }
    };
  }, []);

  return {
    addCardMutation,
    updateCardMutation,
    deleteCardMutation,
    handleReorderCards,
    isReordering: reorderCardsMutation.isPending,
    clearPendingReorder: () => {
      if (reorderTimeout.current) {
        clearTimeout(reorderTimeout.current);
        reorderTimeout.current = null;
      }
    }
  };
}