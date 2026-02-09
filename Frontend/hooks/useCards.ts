import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addCard, updateCard, deleteCard, reorderCard } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { Board, Card, Column, ReorderCard } from '@/types/board';
import { useUpdateBroadcasts } from './useUpdateBroadcasts';
import toast from 'react-hot-toast';

export function useCards(boardId: string) {
  const queryClient = useQueryClient();

  const { addCardBroadcast, updateCardBroadcast, deleteCardBroadcast, reorderCardsBroadcast } = useUpdateBroadcasts();
  
  //ADD CARD
  const addCardMutation = useMutation({
    mutationFn: (params: { columnId: string; title: string; description: string | null; position: string }) =>
      addCard(params.columnId, params.title, params.description, params.position),
    
    onSuccess: (data, _variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) });
      toast.success('Card added successfully');
      addCardBroadcast({ boardId, card: data });
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

    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.board(boardId) });
      
      const previous = queryClient.getQueryData(queryKeys.board(boardId));

      queryClient.setQueryData(queryKeys.board(boardId), (old: Board | undefined) => {
        if (!old) return old;
        
        return {
          ...old,
          columns: old.columns.map((col: Column) => ({
            ...col,
            cards: col.cards.map((card: Card) =>
              card.id === variables.id ? {
                ...card,
                title: variables.title,
                description: variables.description,
                position: variables.position
              } : card
            )
          }))
        };
      });
      return { previous };
    },
    
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) });
      toast.success('Card updated successfully');
      updateCardBroadcast({ boardId, updatedCard: data });
    },
    
    onError: (error, _variables, onMutateResult) => {
      console.error('Failed to update card:', error);
      toast.error('Failed to update card');
      if(onMutateResult?.previous) {
        queryClient.setQueryData(queryKeys.board(boardId), onMutateResult.previous);
      }
    }
  });
  
  //DELETE CARD
  const deleteCardMutation = useMutation({
    mutationFn: (cardId: string) => deleteCard(cardId),
    
    onMutate: async (variable) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.board(boardId) });
      
      const previous = queryClient.getQueryData(queryKeys.board(boardId));
      
      queryClient.setQueryData(queryKeys.board(boardId), (old: Board | undefined) => {
        if (!old) return old;
        
        return {
          ...old,
          columns: old.columns.map((col: Column) => ({
            ...col,
            cards: col.cards.filter((card: Card) => card.id !== variable)
          }))
        };
      });
      
      return { previous };
    },

    onSuccess: (_data, variable) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) });
      toast.success('Card deleted successfully');
      deleteCardBroadcast({ boardId, cardId: variable });
    },
    
    onError: (error, _variable, context) => {
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
    
    onSuccess: (_data, variable) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) });
      reorderCardsBroadcast({ boardId, reorderData: variable });
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