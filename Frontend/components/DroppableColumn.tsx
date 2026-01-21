"use client"

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';
import ColumnContent from "./ColumnContent";
import { Column } from '@/types/board';

export default function DroppableColumn({
  column,
  onAddCard,
  onEdit,
  onDelete,
  isAddPending,
  isEditPending,
  isDeletePending,
  children
}: {
  column: Column;
  onAddCard: (columnId: string) => void;
  onEdit: (columnId: string) => void;
  onDelete: (columnId: string) => void;
  isAddPending: boolean;
  isEditPending: boolean;
  isDeletePending: boolean;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: column.id 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
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
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="group bg-gray-100 w-full p-4 rounded-lg shadow-md">
      <div className="w-full min-h-100 cursor-grab active:cursor-grabbing">
        <ColumnContent column={column}>
          {children}
        </ColumnContent>
      </div>
      <button onPointerDown={(e) => e.stopPropagation()} onClick={handleAddCardClick} className="opacity-0 group-hover:opacity-100 mt-4 bg-green-500 text-white p-2 rounded w-full">Add Card</button>
      <div className="flex justify-between gap-12 opacity-0 group-hover:opacity-100 transition">
        <button onPointerDown={(e) => e.stopPropagation()} disabled={isAddPending || isEditPending || isDeletePending} onClick={handleEditClick} className="mt-4 bg-blue-500 text-white p-2 rounded w-full">Edit Column</button>
        <button onPointerDown={(e) => e.stopPropagation()} disabled={isAddPending || isEditPending || isDeletePending} onClick={handleDeleteClick} className="mt-4 bg-red-500 text-white p-2 rounded w-full">Delete Column</button>
      </div>
    </div>
  );
}