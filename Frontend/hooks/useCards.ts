import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addCard, updateCard, deleteCard, reorderCard } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { Card, ReorderCard } from '@/types/board';
import { useUpdateBroadcasts } from './useUpdateBroadcasts';
import toast from 'react-hot-toast';
import { add } from '@dnd-kit/utilities';

export function useCards(boardId: string) {
  const queryClient = useQueryClient();

  const { addCardBroadcast, updateCardBroadcast, deleteCardBroadcast, reorderCardsBroadcast } = useUpdateBroadcasts();
  
  //ADD CARD
  const addCardMutation = useMutation({
    mutationFn: (params: { columnId: string; title: string; description: string | null; position: string }) =>
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
      addCardBroadcast({ boardId, card: newCard });
    },
    
    onError: (error) => {
      console.error('Failed to add card:', error);
      toast.error('Failed to add card');
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) });
    }
  });
  
  //UPDATE CARD
  const updateCardMutation = useMutation({
    mutationFn: (params: { id: string; title: string; description: string | null; position: string }) =>
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
      updateCardBroadcast({ boardId, card: updatedCard });
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

    onSuccess: (_, cardId) => {
      toast.success('Card deleted successfully');
      deleteCardBroadcast({ boardId, cardId });
    },
    
    onError: (error, variables, context) => {
      console.error('Failed to delete card:', error);
      toast.error('Failed to delete card');
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.board(boardId), context.previous);
      }
    }
  });
  
  //REORDER CARDS
  const reorderCardsMutation = useMutation({
    mutationFn: (data: ReorderCard) => reorderCard(data),
    
    onSuccess: (_, data) => {
      reorderCardsBroadcast({ boardId, reorderData: data });
    },

    onError: (error) => {
      console.error('Failed to reorder cards:', error);
      toast.error('Failed to reorder cards');
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) });
    }
  });

  return {
    addCardMutation,
    updateCardMutation,
    deleteCardMutation,
    reorderCardsMutation,
  };
}