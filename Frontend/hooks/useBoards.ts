import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBoard, getBoards, addBoard, updateBoard, deleteBoard } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { Board, CategorizedBoards } from '@/types/board';
import toast from 'react-hot-toast';

export function useBoard(boardId: string) {
  const queryClient = useQueryClient();

  //Get Board
  const getBoardQuery = useQuery({
    queryKey: queryKeys.board(boardId),
    queryFn: () => getBoard(boardId),
    enabled: !!boardId,
  });


  //Update Board
  const updateBoardMutation = useMutation({
    mutationFn: (params: { id: string; name: string }) => updateBoard(params.id, params.name),

    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.board(boardId) });
      await queryClient.cancelQueries({ queryKey: queryKeys.boards() });

      const previousBoard = queryClient.getQueryData(queryKeys.board(boardId));
      const previousBoards = queryClient.getQueryData(queryKeys.boards());

      const previous = { previousBoard, previousBoards };

      queryClient.setQueryData(queryKeys.board(boardId), (old: Board | undefined) => {
        if (!old) return old;
        
        return {
          ...old,
          name: variables.name
        };
      });

      queryClient.setQueryData(queryKeys.boards(), (old: CategorizedBoards | undefined) => {
        if (!old) return old;
        return {
          ownedBoards: old.ownedBoards.map(board => board.id === variables.id ? { ...board, name: variables.name } : board),
          sharedBoards: old.sharedBoards.map(board => board.id === variables.id ? { ...board, name: variables.name } : board)
        };
      });

      return { previous };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.boards() });
      toast.success('Board updated successfully');
    },

    onError: (error, _variables, onMutateResult) => {
      console.error('Failed to update board:', error);
      toast.error('Failed to update board');
      if(onMutateResult?.previous){
        queryClient.setQueryData(queryKeys.board(boardId), onMutateResult.previous.previousBoard);
        queryClient.setQueryData(queryKeys.boards(), onMutateResult.previous.previousBoards);
      }
    }
  });

  //Delete Board
  const deleteBoardMutation = useMutation({
    mutationFn: (id: string) => deleteBoard(id),

    onMutate: async (variable) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.board(variable) });
      await queryClient.cancelQueries({ queryKey: queryKeys.boards() });

      const previousBoard = queryClient.getQueryData(queryKeys.board(boardId));
      const previousBoards = queryClient.getQueryData(queryKeys.boards());

      const previous = { previousBoard, previousBoards };

      queryClient.removeQueries({ queryKey: queryKeys.board(variable) });
      queryClient.setQueryData(queryKeys.boards(), (old: CategorizedBoards | undefined) => {
        if (!old) return old;
        return {
          ownedBoards: old.ownedBoards.filter(board => board.id !== variable),
          sharedBoards: old.sharedBoards.filter(board => board.id !== variable)
        };
      });

      return { previous };
    },

    onSuccess: () => {
      toast.success('Board deleted successfully');
    },

    onError: (error, variable, onMutateResult) => {
      console.error('Failed to delete board:', error);
      toast.error('Failed to delete board');
      if (onMutateResult?.previous) {
        queryClient.setQueryData(queryKeys.board(variable), onMutateResult.previous.previousBoard);
        queryClient.setQueryData(queryKeys.boards(), onMutateResult.previous.previousBoards);
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


  //Get all Boards
  const getBoardsQuery = useQuery({
    queryKey: queryKeys.boards(),
    queryFn: () => getBoards(),
  });

  //Add Board
  const addBoardMutation = useMutation({
    mutationFn: (name: string) => addBoard(name),

    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.boards(), (old: CategorizedBoards | undefined) => {
        if (!old) return old;
        return {
          ownedBoards: [...old.ownedBoards, data],
          sharedBoards: old.sharedBoards
        };
      });
      toast.success('Board created successfully');
    },

    onError: (error) => {
      console.error('Failed to create board:', error);
      toast.error('Failed to create board');
      queryClient.invalidateQueries({ queryKey: queryKeys.boards() });
    }
  });

  return {
    getBoardsQuery,
    addBoardMutation
  };
}