import { useState } from 'react';

export default function CardModal({
  columnId,
  addCardToColumn,
  closeCardModal
}: {
  columnId: string;
  addCardToColumn: (columnId: string, card: { id: string; title: string; description: string }) => void;
  closeCardModal: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload
    
    if (title.trim()) {
      addCardToColumn(columnId, {
        id: crypto.randomUUID(),
        title,
        description
      });
      setTitle('');
      setDescription('');
      closeCardModal();
    }
  };

  return (
    <div className="p-2 rounded-md bg-gray-500">
      <h2 className="text-2xl font-semibold">Card Modal for Column ID: {columnId}</h2>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Card Title"
          className="border p-2 w-full mb-4"
        />
        
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Card Description"
          className="border p-2 w-full mb-4"
        />
        
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Add Card
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