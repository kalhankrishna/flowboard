"use client";

import { useState, useEffect } from 'react';
import { Column } from '@/types/board';

export default function ColumnModal({
  mode,
  columnId,
  existingColumn,
  onAddColumn,
  onEditColumn,
  closeColumnModal,
  isPending
}: {
  mode: 'add' | 'edit';
  columnId: string | null;
  existingColumn?: Column;
  onAddColumn: (title: string) => void;
  onEditColumn: (columnId: string, title: string) => void;
  closeColumnModal: () => void;
  isPending: boolean;
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
      onAddColumn(
        title.trim()
      );
    } else if (mode === 'edit' && columnId && existingColumn) {
      onEditColumn(
        columnId,
        title.trim()
      );
    }
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
        
        <button type="submit" disabled={isPending} className="bg-blue-500 text-white p-2 rounded">
          {mode === 'add' ? 'Add Column' : isPending ? 'Saving...' : 'Save Changes'}
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