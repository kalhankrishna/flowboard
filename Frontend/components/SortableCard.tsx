"use client";

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import CardContent from './CardContent';
import { Card } from '@/types/board';

export default function SortableCard({
  canEdit,
  card,
  isLocked,
  lockedBy,
  onEdit,
  onDelete,
  isPending
}: {
  canEdit: boolean;
  card: Card;
  isLocked: boolean;
  lockedBy?: string;
  onEdit: (cardId: string) => void;
  onDelete: (cardId: string) => void;
  isPending: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: card.id,
    disabled: isLocked,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: (isDragging || isLocked) ? 0.5 : 1,
    cursor: isLocked ? 'not-allowed' : 'grab',
    zIndex: 100,
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
      className="group relative p-2 bg-slate-300 rounded-md my-2 shadow-md"
    >
      <CardContent card={card} />
      {isLocked && lockedBy && (
        <div className='absolute top-2 left-2 w-8 h-8 rounded-full border-2 border-white flex items-center justify-center bg-black text-white text-sm font-medium'>
          {lockedBy.charAt(0).toUpperCase()}
        </div>
      )}
      {canEdit && (
        <div className='absolute top-2 right-2 flex items-center justify-between gap-x-2'>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            disabled={isPending}
            onClick={handleEditClick}
            className="opacity-0 group-hover:opacity-100 bg-blue-500 text-white px-2 py-1 rounded text-sm transition"
          >
            Edit
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            disabled={isPending}
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