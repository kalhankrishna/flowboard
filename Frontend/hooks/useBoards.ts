import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBoard, getBoards, addBoard, updateBoard, deleteBoard } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { Board } from '@/types/board';

export function useBoard(boardId: string) {
  const queryClient = useQueryClient();

  const getBoardQuery = useQuery({
    queryKey: queryKeys.board(boardId),
    queryFn: () => getBoard(boardId),
    enabled: !!boardId,
  });

  const updateBoardMutation = useMutation({
    mutationFn: (params: { id: string; name: string }) => updateBoard(params.id, params.name),

    onSuccess: (updatedBoard) => {
      queryClient.setQueryData(queryKeys.board(updatedBoard.id), updatedBoard);
      queryClient.setQueryData(queryKeys.boards(), (old: Board[] | undefined) => {
        if (!old) return old;
        return old.map(board =>
          board.id === updatedBoard.id ? updatedBoard : board
        );
      });
    },

    onError: (error) => {
      console.error('Failed to update board:', error);
      queryClient.invalidateQueries({ queryKey: queryKeys.boards() });
    }
  });

  const deleteBoardMutation = useMutation({
    mutationFn: (id: string) => deleteBoard(id),

    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.boards() });

      const previous = queryClient.getQueryData(queryKeys.boards());

      queryClient.setQueryData(queryKeys.boards(), (old: Board[] | undefined) => {
        if (!old) return old;
        return old.filter(board => board.id !== id);
      });

      return { previous };
    },

    onError: (error, variables, context) => {
      console.error('Failed to delete board:', error);
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.boards(), context.previous);
      }
    }
  });

  return {
    getBoardQuery,
    updateBoardMutation,
    deleteBoardMutation
  };
}

export function useBoards(){
  const queryClient = useQueryClient();

  const getBoardsQuery = useQuery({
    queryKey: queryKeys.boards(),
    queryFn: () => getBoards(),
  });

  const addBoardMutation = useMutation({
    mutationFn: (name: string) => addBoard(name),

    onSuccess: (newBoard) => {
      queryClient.setQueryData(queryKeys.boards(), (old: Board[] | undefined) => {
        if (!old) return old;
        return [...old, newBoard];
      });
    },

    onError: (error) => {
      console.error('Failed to create board:', error);
      queryClient.invalidateQueries({ queryKey: queryKeys.boards() });
    }
  });

  return {
    getBoardsQuery,
    addBoardMutation
  };
}