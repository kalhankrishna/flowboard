"use client";

import { useState } from 'react';
import { useBoards } from '@/hooks';
import BoardCard from '@/components/BoardCard';
import BoardModal from '@/components/BoardModal';

export default function DashboardPage() {
  const { getBoardsQuery, addBoardMutation } = useBoards();
  const { data, isLoading, error } = getBoardsQuery;
  
  const [boardModal, setBoardModal] = useState<{ 
    open: boolean; 
    mode: 'add' | 'edit' | null;
    boardId: string | null;
  }>({
    open: false,
    mode: null,
    boardId: null,
  });

  const [updateIsPending, setUpdateIsPending] = useState(false);
  const [deleteIsPending, setDeleteIsPending] = useState(false);

  //Helpers
  function findBoard(id: string) {
    if (!data || !id) return undefined;
    const allBoards = [...data.ownedBoards, ...data.sharedBoards];
    return allBoards.find(board => board.id === id);
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

  const { ownedBoards, sharedBoards } = data || { ownedBoards: [], sharedBoards: [] };
  const hasNoBoards = ownedBoards.length === 0 && sharedBoards.length === 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Boards</h1>
        <button 
          onClick={() => openAddBoardModal()}
          disabled={addBoardMutation.isPending || updateIsPending || deleteIsPending}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Create Board
        </button>
      </div>
      
      {hasNoBoards ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">You don't have any boards yet.</p>
          <button 
            onClick={() => openAddBoardModal()}
            disabled={addBoardMutation.isPending || updateIsPending || deleteIsPending}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Create Your First Board
          </button>
        </div>
      ) : (
        <>
          {/* Owned Boards Section */}
          {ownedBoards.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">My Boards</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ownedBoards.map((board: any) => (
                  <BoardCard 
                    key={board.id} 
                    board={board} 
                    onEditBoard={openEditBoardModal} 
                    isAddingBoard={addBoardMutation.isPending} 
                    onDeleteIsPending={setDeleteIsPending} 
                    isUpdatingBoard={updateIsPending} 
                  />
                ))}
              </div>
            </div>
          )}

          {/* Shared Boards Section */}
          {sharedBoards.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Shared with Me</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sharedBoards.map((board: any) => (
                  <BoardCard 
                    key={board.id} 
                    board={board} 
                    onEditBoard={openEditBoardModal} 
                    isAddingBoard={addBoardMutation.isPending} 
                    onDeleteIsPending={setDeleteIsPending} 
                    isUpdatingBoard={updateIsPending} 
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {boardModal.open && (
        <BoardModal 
          mode={boardModal.mode!}
          boardId={boardModal.boardId}
          existingBoard={boardModal.boardId ? findBoard(boardModal.boardId) : undefined}
          onAddBoard={handleAddBoard}
          closeBoardModal={closeBoardModal}
          isAddingBoard={addBoardMutation.isPending}
          onUpdateIsPending={setUpdateIsPending}
          isDeletingBoard={deleteIsPending}
        />
      )}
    </div>
  );
}