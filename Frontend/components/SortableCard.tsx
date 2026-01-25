"use client"

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import CardContent from './CardContent';
import { Card } from '@/types/board';

export default function SortableCard({
  canEdit,
  card,
  onEdit,
  onDelete,
  isAddPending,
  isEditPending,
  isDeletePending
}: {
  canEdit: boolean;
  card: Card;
  onEdit: (cardId: string) => void;
  onDelete: (cardId: string) => void;
  isAddPending: boolean;
  isEditPending: boolean;
  isDeletePending: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: card.id 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleEditClick = () => {
    onEdit(card.id);
  };

  const handleDeleteClick = () => {
    onDelete(card.id);
  };

  return(
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group relative p-2 bg-slate-300 rounded-md my-2 shadow-md cursor-grab active:cursor-grabbing"
    >
      <CardContent card={card} />

      {canEdit && (
        <div className='absolute top-2 right-2 flex items-center justify-between gap-x-2'>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            disabled={isAddPending || isEditPending || isDeletePending}
            onClick={handleEditClick}
            className="opacity-0 group-hover:opacity-100 bg-blue-500 text-white px-2 py-1 rounded text-sm transition"
          >
            Edit
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            disabled={isAddPending || isEditPending || isDeletePending}
            onClick={handleDeleteClick}
            className="opacity-0 group-hover:opacity-100 bg-red-500 text-white px-2 py-1 rounded text-sm transition"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}