"use client";

import { useState } from 'react';
import { useBoards } from '@/hooks';
import BoardCard from '@/components/BoardCard';
import BoardModal from '@/components/BoardModal';
import {Plus} from 'lucide-react';

export default function DashboardPage() {
  const { getBoardsQuery, addBoardMutation } = useBoards();
  const { data, isLoading } = getBoardsQuery;
  
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

  const { ownedBoards, sharedBoards } = data || { ownedBoards: [], sharedBoards: [] };
  const hasNoBoards = ownedBoards.length === 0 && sharedBoards.length === 0;

  return (
    <div className='pl-8 pr-8'>
      <div className="flex items-center justify-between mt-6 mb-8">
        <div className='flex flex-col items-start'>
          <h1 className="text-3xl font-bold font-heading text-gray-700">Your Boards</h1>
          <p className="text-sm text-gray-400">Create, manage, and collaborate on boards.</p>
        </div>
        <button 
          onClick={() => openAddBoardModal()}
          disabled={addBoardMutation.isPending || updateIsPending || deleteIsPending}
          className="bg-cyan-500 text-white flex items-center justify-center gap-2 px-2 py-2 rounded-md hover:bg-cyan-400 hover:cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className='inline-block'><Plus /></span>
          New Board
        </button>
      </div>
      
      {hasNoBoards ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">You don&apos;t have any boards yet.</p>
          <button 
            onClick={() => openAddBoardModal()}
            disabled={addBoardMutation.isPending || updateIsPending || deleteIsPending}
            className="bg-cyan-500 text-white px-4 py-2 rounded-md hover:bg-cyan-400 hover:cursor-pointer transition"
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