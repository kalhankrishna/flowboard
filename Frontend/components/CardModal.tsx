"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/types/board';
import { Column } from '@/types/board';
import { addCard, updateCard } from '@/lib/api';

export default function CardModal({
  mode,
  column,
  cardId,
  existingCard,
  addCardToColumn,
  editCard,
  closeCardModal
}: {
  mode: 'add' | 'edit';
  column: Column;
  cardId: string | null;
  existingCard?: Card;
  addCardToColumn: (columnId: string, card: Card) => void;
  editCard: (cardId: string, updatedCard: { title: string; description: string }) => void;
  closeCardModal: () => void;
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
      addCard(
        column.id,
        title.trim(),
        description.trim() || null,
        column.cards.length || 0
      ).then(card => addCardToColumn(column.id, card));
    } else if (mode === 'edit' && cardId) {
      updateCard(
        cardId,
        title.trim(),
        description.trim() || null,
        existingCard ? existingCard.position : 0
      ).then(updatedCard => 
        editCard(cardId, {
          title: updatedCard.title,
          description: updatedCard.description || ''
        })
      );
    }
    
    setTitle('');
    setDescription('');
    closeCardModal();
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
        
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          {mode === 'add' ? 'Add Card' : 'Save Changes'}
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