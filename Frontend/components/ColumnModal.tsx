"use client";

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-200">
      <div className="relative bg-white p-6 rounded-lg max-w-md w-full z-300">
        <div className='flex items-center justify-between'>
          <h2 className="text-2xl font-semibold font-heading text-gray-700">
            {mode === 'add' ? 'Add New Column' : 'Edit Column'}
          </h2>
          <button
            onClick={closeColumnModal}
            className="text-gray-500 hover:text-gray-700 hover:cursor-pointer transition"
          >
            <X className='size-6'/>
          </button>
        </div>
        <h2 className="text-md text-gray-400 mb-4">{mode === 'add' ? 'Create a new column for the board' : 'Change the name of this column'}</h2>
        
        <form onSubmit={handleSubmit}>
          <label htmlFor="new-column-title" className="block text-sm font-medium text-gray-600 mb-1">Column Name</label>
          <input
            type="text"
            id="new-column-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Column Title"
            className="mb-4 border border-gray-300 text-gray-700 p-2 w-full rounded focus:outline-0 focus:ring-1 focus:ring-cyan-400 placeholder:text-gray-300 transition"
            autoFocus
          />
          
          <div className='flex items-center justify-start gap-2'>
            <button type="submit" disabled={isPending} className="bg-cyan-500 text-white px-4 py-2 rounded-md hover:bg-cyan-400 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition">
              {mode === 'add' ? 'Add Column' : isPending ? 'Saving...' : 'Save Changes'}
            </button>
            
            <button
              type="button"
              onClick={closeColumnModal}
              className="text-cyan-500 border px-4 py-2 hover:bg-cyan-300 hover:text-white hover:cursor-pointer rounded-md transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      <div 
        className="fixed inset-0 z-0"
        onClick={() => closeColumnModal()}
      />
    </div>
  );
}