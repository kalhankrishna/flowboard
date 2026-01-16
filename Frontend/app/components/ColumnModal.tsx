"use client";

import { useState, useEffect } from 'react';
import { Board, Column } from '@/types/board';
import { addColumn, updateColumn } from '@/lib/api';

export default function ColumnModal({
  mode,
  board,
  columnId,
  existingColumn,
  addColumnToState,
  editColumn,
  closeColumnModal
}: {
  mode: 'add' | 'edit';
  board: Board;
  columnId: string | null;
  existingColumn?: Column;
  addColumnToState: (column: Column) => void;
  editColumn: (columnId: string, updatedColumn: { title: string }) => void;
  closeColumnModal: () => void;
}) {
  const [title, setTitle] = useState(existingColumn?.title || '');

  useEffect(() => {
    if (existingColumn) {
      setTitle(existingColumn.title);
    } else {
      setTitle('');
    }
  }, [existingColumn]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    if (mode === 'add') {
      addColumn(
        board.id,
        title.trim(),
        board.columns.length || 0
      ).then(column => addColumnToState(column));
    } else if (mode === 'edit' && columnId) {
      updateColumn(
        columnId,
        title.trim(),
        existingColumn ? existingColumn.position : 0
      ).then(updatedColumn => 
        editColumn(columnId, {
          title: updatedColumn.title
        })
      );
    }
    
    setTitle('');
    closeColumnModal();
  };

  return (
    <div className="p-2 rounded-md bg-gray-500">
      <h2 className="text-2xl font-semibold">
        {mode === 'add' ? 'Add New Column' : 'Edit Column'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Column Title"
          className="border p-2 w-full mb-4"
          autoFocus
        />
        
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          {mode === 'add' ? 'Add Column' : 'Save Changes'}
        </button>
        
        <button
          type="button"
          onClick={closeColumnModal}
          className="ml-2 bg-gray-500 text-white p-2 rounded"
        >
          Cancel
        </button>
      </form>
    </div>
  );
}