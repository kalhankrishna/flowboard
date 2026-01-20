'use client';

import { useEffect, useState } from 'react';
import { Board } from '@/types/board';
import { useBoard } from '@/hooks';

export default function BoardModal({
  mode,
  boardId,
  existingBoard,
  onAddBoard,
  closeBoardModal,
}: {
  mode: 'add' | 'edit';
  boardId: string | null;
  existingBoard?: Board;
  onAddBoard: (name: string) => void;
  closeBoardModal: () => void;
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-semibold mb-4">{mode === 'add' ? 'Create New Board' : 'Edit Board'}</h2>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
            placeholder="Board name"
            className="border p-2 w-full mb-4 rounded"
            autoFocus
          />
          
          <div className="flex gap-2">
            <button 
              type="submit" 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {mode === 'add' ? 'Create Board' : 'Save Changes'}
            </button>
            
            <button
              type="button"
              onClick={closeBoardModal}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}