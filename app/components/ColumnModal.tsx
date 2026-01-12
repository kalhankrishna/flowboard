"use client";

import { useState, useEffect } from 'react';

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
  existingColumn?: { id: string; title: string };
  addColumn: (column: { id: string; title: string }) => void;
  editColumn: (columnId: string, updatedColumn: { title: string }) => void;
  closeColumnModal: () => void;
}) {
  const [title, setTitle] = useState(existingColumn?.title || '');

  // Reset form when existingCard changes (switching between add/edit)
  useEffect(() => {
    if (existingColumn) {
      setTitle(existingColumn.title);
    } else {
      setTitle('');
    }
  }, [existingColumn]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return; // Don't submit if title is empty
    
    if (mode === 'add') {
      addColumn({
        id: crypto.randomUUID(),
        title
      });
    } else if (mode === 'edit' && columnId) {
      editColumn(columnId, {
        title
      });
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