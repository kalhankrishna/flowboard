'use client';

import { useState } from 'react';
import { useBoards } from '@/hooks';
import BoardCard from '@/components/BoardCard';
import BoardModal from '@/components/BoardModal';

export default function DashboardPage() {
  const { getBoardsQuery, addBoardMutation } = useBoards();
  const { data: boards, isLoading, error } = getBoardsQuery;
  

  const [boardModal, setBoardModal] = useState<{ 
    open: boolean; 
    mode: 'add' | 'edit' | null;
    boardId: string | null;
  }>({
    open: false,
    mode: null,
    boardId: null,
  });

  //Helpers
  function findBoard(id: string) {
    if (!boards || !id) return undefined;
    return boards.find(board => board.id === id);
  }

  //Modal Handlers
  function openAddBoardModal() {
    setBoardModal({ open: true, mode: 'add', boardId: null });
  }

  function openEditBoardModal(boardId: string) {
    setBoardModal({ 
      open: true, 
      mode: 'edit', 
      boardId: boardId
    });
  }

  function closeBoardModal() {
    setBoardModal({ open: false, mode: null, boardId: null });
  }

  //Mutation Handlers
  function handleAddBoard(name: string) {
    addBoardMutation.mutate(name);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-gray-600">Loading boards...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-red-600">Error loading boards: {error.message}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Boards</h1>
        <button 
          onClick={() => openAddBoardModal()}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Create Board
        </button>
      </div>
      
      {!boards || boards.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">You don't have any boards yet.</p>
          <button 
            onClick={() => openAddBoardModal()}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Create Your First Board
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.map((board: any) => (
            <BoardCard key={board.id} board={board} onEditBoard={openEditBoardModal} />
          ))}
        </div>
      )}

      {boardModal.open && (
      <BoardModal 
        mode={boardModal.mode!}
        boardId={boardModal.boardId}
        existingBoard={boardModal.boardId ? findBoard(boardModal.boardId) : undefined}
        onAddBoard={handleAddBoard}
        closeBoardModal={closeBoardModal}
      />
      )}
    </div>
  );
}