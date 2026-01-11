"use client"

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import CardContent from './CardContent';

export default function SortableCard({card}: {card: {id: string; title: string; description: string}}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
      id: card.id 
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return(
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="p-2 bg-slate-300 rounded-md my-2 cursor-grab active:cursor-grabbing"
      >
        <CardContent card={card} />
      </div>
    );
}