"use client";

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Card, Column } from '@/types/board';

export default function CardModal({
  mode,
  column,
  cardId,
  existingCard,
  onAddCard,
  onEditCard,
  closeCardModal,
  isPending
}: {
  mode: 'add' | 'edit';
  column: Column;
  cardId: string | null;
  existingCard?: Card;
  onAddCard: (columnId: string, title: string, description: string | null) => void;
  onEditCard: (cardId: string, title: string, description: string | null) => void;
  closeCardModal: () => void;
  isPending: boolean;
}) {
  const [title, setTitle] = useState(existingCard?.title || '');
  const [description, setDescription] = useState(existingCard?.description || '');

  useEffect(() => {
    if (existingCard) {
      setTitle(existingCard.title);
      setDescription(existingCard.description || '');
    } else {
      setTitle('');
      setDescription('');
    }
  }, [existingCard]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    if (mode === 'add') {
      onAddCard(
        column.id,
        title.trim(),
        description.trim() || null
      );
    } else if (mode === 'edit' && cardId && existingCard) {
      onEditCard(
        cardId,
        title.trim(),
        description.trim() || null
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-200">
      <div className="relative bg-white p-6 rounded-lg max-w-md w-full z-300">
        <div className='flex items-center justify-between'>
          <h2 className="text-2xl font-semibold font-heading text-gray-700">
            {mode === 'add' ? 'Add New Card' : 'Edit Card'}
          </h2>
          <button
            onClick={closeCardModal}
            className="text-gray-500 hover:text-gray-700 hover:cursor-pointer transition"
          >
            <X className='size-6'/>
          </button>
        </div>
        <h2 className="text-md text-gray-400 mb-4">{mode === 'add' ? 'Create a new card for this column' : 'Update the card details'}</h2>
        
        <form onSubmit={handleSubmit}>
          <label htmlFor="new-card-title" className="block text-sm font-medium text-gray-600 mb-1">Card Name</label>
          <input
            type="text"
            id="new-card-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Card Title"
            className="mb-4 border border-gray-300 text-gray-700 p-2 w-full rounded focus:outline-0 focus:ring-1 focus:ring-cyan-400 placeholder:text-gray-300 transition"
            autoFocus
          />
          
          <label htmlFor="new-card-description" className="block text-sm font-medium text-gray-600 mb-1">Card Description</label>
          <textarea
            id="new-card-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description..."
            className="mb-2 border border-gray-300 text-gray-700 p-2 w-full rounded focus:outline-0 focus:ring-1 focus:ring-cyan-400 placeholder:text-gray-300 transition"
          />
          
          <div className='flex items-center justify-start gap-2'>
            <button type="submit" disabled={isPending} className="bg-cyan-500 text-white px-4 py-2 rounded-md hover:bg-cyan-400 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition">
              {mode === 'add' ? 'Add Card' : isPending ? 'Saving...' : 'Save Changes'}
            </button>
            
            <button
              type="button"
              onClick={closeCardModal}
              className="text-cyan-500 border px-4 py-2 hover:bg-cyan-300 hover:text-white hover:cursor-pointer rounded-md transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      <div 
        className="fixed inset-0 z-0"
        onClick={() => closeCardModal()}
      />
    </div>
  );
}