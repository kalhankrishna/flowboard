"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';
import { Pencil, Trash2, Plus } from 'lucide-react';
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
    zIndex: 100,
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
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="group/column relative border bg-zinc-100 w-full p-4 rounded-lg shadow-md">
      <div className="w-full min-h-90">
        <ColumnContent column={column}>
          {children}
        </ColumnContent>
      </div>
      {isLocked && lockedBy && (
        <div title={lockedBy} className='absolute top-3 right-24 w-6 h-6 rounded-full flex items-center justify-center bg-cyan-500 text-white text-sm font-medium'>
          {lockedBy.charAt(0).toUpperCase()}
        </div>
      )}
      {canEdit && (
        <div className=" transition">
          <button onPointerDown={(e) => e.stopPropagation()} disabled={isPending} onClick={handleAddCardClick} className="flex items-center justify-center gap-2 mt-4 bg-cyan-500 text-white p-2 rounded-lg w-full hover:bg-cyan-400 hover:cursor-pointer transition">
            <span className="inline-block">
              <Plus className="size-4" />
            </span>
            Add Card
          </button>
          <div className="absolute top-2 right-4 flex items-center justify-center gap-2">
            <button onPointerDown={(e) => e.stopPropagation()} disabled={isPending} onClick={handleEditClick} className="text-gray-400 p-2 rounded-lg hover:bg-cyan-100 hover:text-cyan-400 hover:cursor-pointer transition">
              <Pencil className="size-4" />
            </button>
            <button onPointerDown={(e) => e.stopPropagation()} disabled={isPending} onClick={handleDeleteClick} className="text-gray-400 p-2 rounded-lg hover:bg-red-100 hover:text-red-400 hover:cursor-pointer transition">
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}