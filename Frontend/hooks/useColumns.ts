import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addColumn, updateColumn, deleteColumn, reorderColumn } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { Board, Column, ReorderColumn } from '@/types/board';
import { useUpdateBroadcasts } from './useUpdateBroadcasts';
import toast from 'react-hot-toast';

export function useColumns(boardId: string) {
  const queryClient = useQueryClient();

  const {addColumnBroadcast, updateColumnBroadcast, deleteColumnBroadcast, reorderColumnsBroadcast} = useUpdateBroadcasts();
  
  //ADD COLUMN
  const addColumnMutation = useMutation({
    mutationFn: (params: { boardId: string; title: string }) =>
      addColumn(params.boardId, params.title),
    
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) });
      toast.success('Column added successfully');
      addColumnBroadcast({ boardId, column: data });
    },
    
    onError: (error) => {
      console.error('Failed to add column:', error);
      toast.error('Failed to add column');
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) });
    }
  });
  
  //UPDATE COLUMN
  const updateColumnMutation = useMutation({
    mutationFn: (params: { id: string; title: string }) =>
      updateColumn(params.id, params.title),

    onMutate: async (variables) => {
      await queryClient.cancelQueries({queryKey: queryKeys.board(boardId)});

      const previous = queryClient.getQueryData(queryKeys.board(boardId));

      queryClient.setQueryData(queryKeys.board(boardId), (old: Board | undefined) => {
        if (!old) return old;
        
        return {
          ...old,
          columns: old.columns.map((col: Column) =>
            col.id === variables.id
              ? { ...col, title: variables.title }
              : col
          )
        };
      });

      return { previous };
    },
    
    onSuccess: (data) => {
      //queryClient.invalidateQueries({queryKey: queryKeys.board(boardId)});
      toast.success('Column updated successfully');
      updateColumnBroadcast({boardId, updatedColumn: data});
    },
    
    onError: (error, _variables, onMutateResult) => {
      console.error('Failed to update column:', error);
      toast.error('Failed to update column');
      if(onMutateResult?.previous){
        queryClient.setQueryData(queryKeys.board(boardId), onMutateResult.previous);
      }
    }
  });
  
  //DELETE COLUMN
  const deleteColumnMutation = useMutation({
    mutationFn: (columnId: string) => deleteColumn(columnId),
    
    onMutate: async (variable) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.board(boardId) });
      
      const previous = queryClient.getQueryData(queryKeys.board(boardId));
      
      queryClient.setQueryData(queryKeys.board(boardId), (old: Board | undefined) => {
        if (!old) return old;
        
        return {
          ...old,
          columns: old.columns.filter((col: Column) => col.id !== variable)
        };
      });
      
      return { previous };
    },

    onSuccess: (_data, variable) => {
      //queryClient.invalidateQueries({queryKey: queryKeys.board(boardId)});
      toast.success('Column deleted successfully');
      deleteColumnBroadcast({boardId, columnId: variable});
    },
    
    onError: (error, _variable, onMutateResult) => {
      console.error('Failed to delete column:', error);
      toast.error('Failed to delete column');
      if (onMutateResult?.previous) {
        queryClient.setQueryData(queryKeys.board(boardId), onMutateResult.previous);
      }
    }
  });
  
  //REORDER COLUMNS
  const reorderColumnsMutation = useMutation({
    mutationFn: (data : ReorderColumn) => reorderColumn(data),

    onSuccess: (_data, variable) => {
      //queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) });
      reorderColumnsBroadcast({ boardId, reorderData: variable });
    },

    onError: (error) => {
      console.error('Failed to reorder columns:', error);
      toast.error('Failed to reorder columns');
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) });
    }
  });
  
  return {
    addColumnMutation,
    updateColumnMutation,
    deleteColumnMutation,
    reorderColumnsMutation
  };
}