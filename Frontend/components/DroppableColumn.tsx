"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';
import ColumnContent from "./ColumnContent";
import { Column } from '@/types/board';

export default function DroppableColumn({
  canEdit,
  column,
  isLocked,
  lockedBy,
  onAddCard,
  onEdit,
  onDelete,
  isPending,
  children
}: {
  canEdit: boolean;
  column: Column;
  isLocked: boolean;
  lockedBy?: string; 
  onAddCard: (columnId: string) => void;
  onEdit: (columnId: string) => void;
  onDelete: (columnId: string) => void;
  isPending: boolean;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: column.id,
    disabled: isLocked,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isLocked ? 'not-allowed' : 'grab',
  };

  const handleAddCardClick = () => {
    onAddCard(column.id);
  }

  const handleEditClick = () => {
    onEdit(column.id);
  };

  const handleDeleteClick = () => {
    onDelete(column.id);
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="group relative bg-gray-100 w-full p-4 rounded-lg shadow-md">
      <div className="w-full min-h-100">
        <ColumnContent column={column}>
          {children}
        </ColumnContent>
      </div>
      {isLocked && lockedBy && (
        <div className='absolute top-2 left-2 w-8 h-8 rounded-full border-2 border-white flex items-center justify-center bg-black text-white text-sm font-medium'>
          {lockedBy.charAt(0).toUpperCase()}
        </div>
      )}
      {canEdit && (
        <div>
          <button onPointerDown={(e) => e.stopPropagation()} disabled={isPending} onClick={handleAddCardClick} className="opacity-0 group-hover:opacity-100 mt-4 bg-green-500 text-white p-2 rounded w-full">Add Card</button>
          <div className="flex justify-between gap-12 opacity-0 group-hover:opacity-100 transition">
            <button onPointerDown={(e) => e.stopPropagation()} disabled={isPending} onClick={handleEditClick} className="mt-4 bg-blue-500 text-white p-2 rounded w-full">Edit Column</button>
            <button onPointerDown={(e) => e.stopPropagation()} disabled={isPending} onClick={handleDeleteClick} className="mt-4 bg-red-500 text-white p-2 rounded w-full">Delete Column</button>
          </div>
        </div>
      )}
    </div>
  );
}