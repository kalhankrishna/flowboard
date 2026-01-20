import { useQuery } from '@tanstack/react-query';
import { getBoard } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

export function useBoard(boardId: string) {
  return useQuery({
    queryKey: queryKeys.board(boardId),
    queryFn: () => getBoard(boardId),
    enabled: !!boardId,
  });
}