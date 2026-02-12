"use client";

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Board } from '@/types/board';
import { useBoard } from '@/hooks';

export default function BoardModal({
  mode,
  boardId,
  existingBoard,
  onAddBoard,
  closeBoardModal,
  isAddingBoard,
  onUpdateIsPending,
  isDeletingBoard
}: {
  mode: 'add' | 'edit';
  boardId: string | null;
  existingBoard?: Board;
  onAddBoard: (name: string) => void;
  closeBoardModal: () => void;
  isAddingBoard: boolean;
  onUpdateIsPending: (isPending: boolean) => void;
  isDeletingBoard: boolean;
}) {
  const [boardName, setBoardName] = useState(existingBoard?.name || '');
  const { updateBoardMutation } = useBoard(boardId || '');

  useEffect(() => {
    if (existingBoard) {
        setBoardName(existingBoard.name);
    }
    else {
        setBoardName('');
    }
  }, [existingBoard]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardName.trim()) return;

    if (mode === 'add') {
        onAddBoard(boardName.trim());
    }
    else if (mode === 'edit' && boardId && existingBoard) {
        updateBoardMutation.mutate({ id: boardId, name: boardName.trim() });
    }

    closeBoardModal();
  };

  useEffect(() => {
    onUpdateIsPending(updateBoardMutation.isPending);
  },[updateBoardMutation.isPending, onUpdateIsPending]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-200">
      <div className="relative bg-white p-6 rounded-lg max-w-md w-full z-300">
        <button
          type='button'
          onClick={closeBoardModal}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 hover:cursor-pointer transition"
        >
          <X className='size-6' />
        </button>
        <h2 className="text-2xl text-gray-700 font-semibold font-heading mb-2">{mode === 'add' ? 'Create New Board' : 'Edit Board'}</h2>
        <h2 className="text-sm text-gray-400 mb-4">{mode === 'add' ? 'Give your board a name to get started' : 'Change the name of your board'}</h2>
        
        <form onSubmit={handleSubmit}>
          <label htmlFor="new-board-title" className="block text-sm font-medium text-gray-600 mb-1">Board Name</label>
          <input
            type="text"
            id="new-board-title"
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
            placeholder="e.g. Project Roadmap"
            className="border border-gray-300 text-gray-700 p-2 w-full mb-4 rounded focus:outline-0 focus:ring-1 focus:ring-cyan-400 placeholder:text-gray-300 transition"
            autoFocus
          />
          
          <div className="flex gap-2">
            <button 
              type="submit" 
              disabled={updateBoardMutation.isPending || isAddingBoard || isDeletingBoard}
              className="bg-cyan-500 text-white px-4 py-2 rounded-md hover:bg-cyan-400 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {mode === 'add' ? 'Create Board' : updateBoardMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
            
            <button
              type="button"
              onClick={closeBoardModal}
              className="text-cyan-500 border px-4 py-2 hover:bg-cyan-300 hover:text-white hover:cursor-pointer rounded-md transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      <div 
        className="fixed inset-0 z-0"
        onClick={() => closeBoardModal()}
      />
    </div>
  );
}