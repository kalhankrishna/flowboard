"use client"

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import CardContent from './CardContent';

export default function SortableCard({
  card,
  onEdit,
  onDelete
}: {
  card: { id: string; title: string; description: string };
  onEdit: (cardId: string) => void;
  onDelete: (cardId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: card.id 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleEditClick = (e: React.MouseEvent) => {
    onEdit(card.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this card?')) {
      onDelete(card.id);
    }
  };

  return(
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group relative p-2 bg-slate-300 rounded-md my-2 cursor-grab active:cursor-grabbing"
    >
      <CardContent card={card} />

      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={handleEditClick}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-blue-500 text-white px-2 py-1 rounded text-sm"
      >
        Edit
      </button>
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={handleDeleteClick}
        className="absolute top-2 right-14 opacity-0 group-hover:opacity-100 bg-red-500 text-white px-2 py-1 rounded text-sm"
      >
        Delete
      </button>
    </div>
  );
}