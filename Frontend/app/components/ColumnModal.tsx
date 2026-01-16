"use client";

import { useState, useEffect } from 'react';
import { Column } from '@/types/board';

export default function ColumnModal({
  mode,
  columnId,
  existingColumn,
  addColumn,
  editColumn,
  closeColumnModal
}: {
  mode: 'add' | 'edit';
  columnId: string | null;
  existingColumn?: Column;
  addColumn: (column: Column) => void;
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
      // TEMPORARY: Create fake complete Column object for local state
      // FB-022 will replace this with API call
      const newColumn: Column = {
        id: crypto.randomUUID(), // Temporary
        boardId: 'a770b5dc-8537-49fe-869d-7a0908f9b2d0', // Hardcoded for now
        title: title.trim(),
        position: 0, // Temporary
        cards: [], // Start empty
        createdAt: new Date().toISOString(), // Temporary
        updatedAt: new Date().toISOString()  // Temporary
      };
      addColumn(newColumn);
    } else if (mode === 'edit' && columnId) {
      editColumn(columnId, { title: title.trim() });
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