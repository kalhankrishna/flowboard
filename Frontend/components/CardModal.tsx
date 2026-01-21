"use client";

import { useState, useEffect } from 'react';
import { Card, Column } from '@/types/board';

export default function CardModal({
  mode,
  column,
  cardId,
  existingCard,
  onAddCard,
  onEditCard,
  closeCardModal,
  isAddPending,
  isEditPending,
  isDeletePending
}: {
  mode: 'add' | 'edit';
  column: Column;
  cardId: string | null;
  existingCard?: Card;
  onAddCard: (columnId: string, title: string, description: string | null, position: number) => void;
  onEditCard: (cardId: string, title: string, description: string | null, position: number) => void;
  closeCardModal: () => void;
  isAddPending: boolean;
  isEditPending: boolean;
  isDeletePending: boolean;
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
        description.trim() || null,
        column.cards.length
      );
    } else if (mode === 'edit' && cardId && existingCard) {
      onEditCard(
        cardId,
        title.trim(),
        description.trim() || null,
        existingCard.position
      );
    }
  };

  return (
    <div className="p-2 rounded-md bg-gray-500">
      <h2 className="text-2xl font-semibold">
        {mode === 'add' ? 'Add New Card' : 'Edit Card'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Card Title"
          className="border p-2 w-full mb-4"
          autoFocus
        />
        
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Card Description"
          className="border p-2 w-full mb-4"
        />
        
        <button type="submit" disabled={isAddPending || isEditPending || isDeletePending} className="bg-blue-500 text-white p-2 rounded">
          {mode === 'add' ? 'Add Card' : isEditPending ? 'Saving...' : 'Save Changes'}
        </button>
        
        <button
          type="button"
          onClick={closeCardModal}
          className="ml-2 bg-gray-500 text-white p-2 rounded"
        >
          Cancel
        </button>
      </form>
    </div>
  );
}