"use client";

import Link from 'next/link';
import { Board } from '@/types/board';
import { useBoard, useSharing } from '@/hooks';
import { useEffect } from 'react';
import { BoardRole } from '@/types/share';
import { useAuthStore } from '@/store/authStore';

type BoardCardProps = Board & {
    _count?: {columns: number};
}

export default function BoardCard({ board, onEditBoard, isAddingBoard, onDeleteIsPending, isUpdatingBoard }: { board: BoardCardProps, onEditBoard: (boardId: string) => void, isAddingBoard: boolean, onDeleteIsPending: (isPending: boolean) => void , isUpdatingBoard: boolean}) {
  const {deleteBoardMutation} = useBoard(board.id);

  const user = useAuthStore((state) => state.user);
  
  const { getCollaboratorsQuery } = useSharing(board.id);
  const { data: collaborators } = getCollaboratorsQuery;

  const getUserRole = (): BoardRole | null => {
    if (!user || !collaborators) return null;
    const access = collaborators.find(c => c.userId === user.userId);
    return access?.role || null;
  };

  const userRole = getUserRole();

  const isOwner = userRole === 'OWNER';

  const lastUpdated = new Date(board.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  function handleEditClick(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    onEditBoard(board.id);
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (window.confirm('Are you sure you want to delete this board?')) {
      deleteBoardMutation.mutate(board.id);
    }
  }

  useEffect(() => {
    onDeleteIsPending(deleteBoardMutation.isPending);
  },[deleteBoardMutation.isPending, onDeleteIsPending]);

  return (
    <Link 
      href={`/dashboard/boards/${board.id}`}
      className="group relative block p-6 bg-white rounded-lg shadow hover:shadow-lg transition border border-gray-200 hover:border-blue-500"
    >
      <h2 className="text-xl font-semibold mb-2 text-gray-900">{board.name}</h2>
      
      <div className="text-sm text-gray-600 space-y-1">
        {board._count && (
          <p>{board._count.columns} column{board._count.columns !== 1 ? 's' : ''}</p>
        )}
        <p>Updated {lastUpdated}</p>
      </div>
      {
        isOwner && (
          <div className='absolute top-2 right-2 flex justify-between items-center gap-x-2'>
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={handleEditClick}
              disabled={deleteBoardMutation.isPending || isAddingBoard || isUpdatingBoard}
              className="opacity-0 group-hover:opacity-100 bg-blue-500 text-white px-2 py-1 rounded text-sm transition"
            >
              Edit
            </button>
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={handleDelete}
              disabled={deleteBoardMutation.isPending || isAddingBoard || isUpdatingBoard}
              className="opacity-0 group-hover:opacity-100 bg-red-500 text-white px-2 py-1 rounded text-sm transition"
            >
              Delete
            </button>
          </div>
        )
      }
    </Link>
  );
}