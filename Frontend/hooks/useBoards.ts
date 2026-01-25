import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBoard, getBoards, addBoard, updateBoard, deleteBoard } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { CategorizedBoards } from '@/types/board';
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

    onSuccess: (updatedBoard) => {
      queryClient.setQueryData(queryKeys.board(updatedBoard.id), updatedBoard);
      queryClient.setQueryData(queryKeys.boards(), (old: CategorizedBoards | undefined) => {
        if (!old) return old;
        return {
          ownedBoards: old.ownedBoards.map(board=>board.id===updatedBoard.id?updateBoard:board),
          sharedBoards: old.sharedBoards.map(board=>board.id===updatedBoard.id?updateBoard:board)
        };
      });
      toast.success('Board updated successfully');
    },

    onError: (error) => {
      console.error('Failed to update board:', error);
      toast.error('Failed to update board');
      queryClient.invalidateQueries({ queryKey: queryKeys.boards() });
    }
  });

  //Delete Board
  const deleteBoardMutation = useMutation({
    mutationFn: (id: string) => deleteBoard(id),

    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.boards() });

      const previous = queryClient.getQueryData(queryKeys.boards());

      queryClient.setQueryData(queryKeys.boards(), (old: CategorizedBoards | undefined) => {
        if (!old) return old;
        return {
          ownedBoards: old.ownedBoards.filter(board => board.id !== id),
          sharedBoards: old.sharedBoards.filter(board => board.id !== id)
        };
      });

      return { previous };
    },

    onSuccess: () => {
      toast.success('Board deleted successfully');
    },

    onError: (error, variables, context) => {
      console.error('Failed to delete board:', error);
      toast.error('Failed to delete board');
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


  //Get all Boards
  const getBoardsQuery = useQuery({
    queryKey: queryKeys.boards(),
    queryFn: () => getBoards(),
  });

  //Add Board
  const addBoardMutation = useMutation({
    mutationFn: (name: string) => addBoard(name),

    onSuccess: (newBoard) => {
      queryClient.setQueryData(queryKeys.boards(), (old: CategorizedBoards | undefined) => {
        if (!old) return old;
        return {
          ownedBoards: [...old.ownedBoards, newBoard],
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