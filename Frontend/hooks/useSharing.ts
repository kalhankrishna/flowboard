import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBoardCollaborators, shareBoard, updateCollaboratorRole, removeCollaborator } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { BoardAccess, ShareBoardInput, UpdateRoleInput } from '@/types/share';
import toast from 'react-hot-toast';

export function useSharing(boardId: string) {
    const queryClient = useQueryClient();

    // Get Collaborators
    const getCollaboratorsQuery = useQuery({
        queryKey: queryKeys.collaborators(boardId),
        queryFn: () => getBoardCollaborators(boardId),
        enabled: !!boardId,
        throwOnError: true,
    });

    // Share Board
    const shareBoardMutation = useMutation({
        mutationFn: (data: ShareBoardInput) => shareBoard(boardId, data),

        onSuccess: (newAccess) => {
            queryClient.setQueryData(queryKeys.collaborators(boardId), (old: BoardAccess[] | undefined) => {
                if (!old) return old;
                
                const existingIndex = old.findIndex(a => a.userId === newAccess.userId);
                if (existingIndex >= 0) {
                    const updated = [...old];
                    updated[existingIndex] = newAccess;
                    return updated;
                }

                return [...old, newAccess];
            });

            toast.success('Board shared successfully');
        },

        onError: (error) => {
            console.error('Failed to share board:', error);
            toast.error('Failed to share board');
            queryClient.invalidateQueries({ queryKey: queryKeys.collaborators(boardId) });
        }
    });

    // Update role
    const updateRoleMutation = useMutation({
        mutationFn: (params: { userId: string; role: UpdateRoleInput }) => updateCollaboratorRole(boardId, params.userId, params.role),

        onSuccess: (updatedAccess) => {
            queryClient.setQueryData(queryKeys.collaborators(boardId), (old: BoardAccess[] | undefined) => {
                if (!old) return old;
                return old.map(access =>
                access.userId === updatedAccess.userId ? updatedAccess : access
                );
            });
            
            toast.success('Role updated successfully');
        },

        onError: (error) => {
            console.error('Failed to update role:', error);
            toast.error('Failed to update role');
            queryClient.invalidateQueries({ queryKey: queryKeys.collaborators(boardId) });
        }
    });

    // Remove collaborator
    const removeCollaboratorMutation = useMutation({
        mutationFn: (userId: string) => removeCollaborator(boardId, userId),

        onMutate: async (userId) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.collaborators(boardId) });

            const previous = queryClient.getQueryData(queryKeys.collaborators(boardId));

            queryClient.setQueryData(queryKeys.collaborators(boardId), (old: BoardAccess[] | undefined) => {
                if (!old) return old;
                return old.filter(access => access.userId !== userId);
            });

            return { previous };
        },

        onSuccess: () => {
            toast.success('Collaborator removed');
        },

        onError: (error, _variable, context) => {
            console.error('Failed to remove collaborator:', error);
            toast.error('Failed to remove collaborator');
            if (context?.previous) {
                queryClient.setQueryData(queryKeys.collaborators(boardId), context.previous);
            }
        }
    });

    return {
        getCollaboratorsQuery,
        shareBoardMutation,
        updateRoleMutation,
        removeCollaboratorMutation,
    };
}