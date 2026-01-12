"use client";

import { useState, useEffect } from 'react';

export default function CardModal({
  mode,
  columnId,
  cardId,
  existingCard,
  addCardToColumn,
  editCard,
  closeCardModal
}: {
  mode: 'add' | 'edit';
  columnId: string;
  cardId: string | null;
  existingCard?: { id: string; title: string; description: string };
  addCardToColumn: (columnId: string, card: { id: string; title: string; description: string }) => void;
  editCard: (cardId: string, updatedCard: { title: string; description: string }) => void;
  closeCardModal: () => void;
}) {
  const [title, setTitle] = useState(existingCard?.title || '');
  const [description, setDescription] = useState(existingCard?.description || '');

  // Reset form when existingCard changes (switching between add/edit)
  useEffect(() => {
    if (existingCard) {
      setTitle(existingCard.title);
      setDescription(existingCard.description);
    } else {
      setTitle('');
      setDescription('');
    }
  }, [existingCard]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return; // Don't submit if title is empty
    
    if (mode === 'add') {
      addCardToColumn(columnId, {
        id: crypto.randomUUID(),
        title,
        description
      });
    } else if (mode === 'edit' && cardId) {
      editCard(cardId, {
        title,
        description
      });
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