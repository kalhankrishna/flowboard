import { useRef, useCallback, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addColumn, updateColumn, deleteColumn, reorderColumns } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { Column, ReorderColumns } from '@/types/board';

export function useColumns(boardId: string) {
  const queryClient = useQueryClient();
  const reorderTimeout = useRef<NodeJS.Timeout | null>(null);
  
  //ADD COLUMN
  const addColumnMutation = useMutation({
    mutationFn: (params: { boardId: string; title: string; position: number }) =>
      addColumn(params.boardId, params.title, params.position),
    
    onSuccess: (newColumn) => {
      queryClient.setQueryData(queryKeys.board(boardId), (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          columns: [...old.columns, { ...newColumn, cards: [] }]
        };
      });
    },
    
    onError: (error) => {
      console.error('Failed to add column:', error);
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) });
    }
  });
  
  //UPDATE COLUMN
  const updateColumnMutation = useMutation({
    mutationFn: (params: { id: string; title: string; position: number }) =>
      updateColumn(params.id, params.title, params.position),
    
    onSuccess: (updatedColumn) => {
      queryClient.setQueryData(queryKeys.board(boardId), (old: any) => {
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
    },
    
    onError: (error) => {
      console.error('Failed to update column:', error);
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) });
    }
  });
  
  //DELETE COLUMN
  const deleteColumnMutation = useMutation({
    mutationFn: (columnId: string) => deleteColumn(columnId),
    
    onMutate: async (columnId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.board(boardId) });
      
      const previous = queryClient.getQueryData(queryKeys.board(boardId));
      
      queryClient.setQueryData(queryKeys.board(boardId), (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          columns: old.columns.filter((col: Column) => col.id !== columnId)
        };
      });
      
      return { previous };
    },
    
    onError: (error, variables, context) => {
      console.error('Failed to delete column:', error);
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.board(boardId), context.previous);
      }
    }
  });
  
  //REORDER COLUMNS (DEBOUNCED)
  const reorderColumnsMutation = useMutation({
    mutationFn: (columns: ReorderColumns[]) => reorderColumns(columns),
    
    onError: (error) => {
      console.error('Failed to reorder columns:', error);
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) });
    }
  });
  
  const handleReorderColumns = useCallback((newBoardState: any, columnPositions: ReorderColumns[]) => {
    queryClient.setQueryData(queryKeys.board(boardId), newBoardState);

    if (reorderTimeout.current) {
      clearTimeout(reorderTimeout.current);
    }
    
    reorderTimeout.current = setTimeout(() => {
      reorderColumnsMutation.mutate(columnPositions);
    }, 300);
  }, [boardId, queryClient, reorderColumnsMutation]);

  useEffect(() => {
    return () => {
      if (reorderTimeout.current) {
        clearTimeout(reorderTimeout.current);
      }
    };
  }, []);
  
  return {
    addColumnMutation,
    updateColumnMutation,
    deleteColumnMutation,
    handleReorderColumns,
    isReordering: reorderColumnsMutation.isPending,
    clearPendingReorder: () => {
      if (reorderTimeout.current) {
        clearTimeout(reorderTimeout.current);
        reorderTimeout.current = null;
      }
    }
  };
}