"use client";

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Pencil, Trash2 } from 'lucide-react';
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
      className="group/card relative p-2 bg-linear-to-br from-slate-50 to-stone-100 rounded-md my-2 border border-gray-300 hover:shadow-md"
    >
      <CardContent card={card} />
      {isLocked && lockedBy && (
        <div title={lockedBy} className='absolute top-2 right-24 w-6 h-6 rounded-full flex items-center justify-center bg-cyan-500 text-white text-sm font-medium'>
          {lockedBy.charAt(0).toUpperCase()}
        </div>
      )}
      {canEdit && (
        <div className='absolute top-1 right-2 flex items-center justify-between gap-x-2 opacity-0 group-hover/card:opacity-100'>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            disabled={isPending}
            onClick={handleEditClick}
            className="text-gray-400 p-2 rounded-lg hover:bg-cyan-100 hover:text-cyan-400 hover:cursor-pointer transition"
          >
            <Pencil className="size-4" />
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            disabled={isPending}
            onClick={handleDeleteClick}
            className="text-gray-400 p-2 rounded-lg hover:bg-red-100 hover:text-red-400 hover:cursor-pointer transition"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}