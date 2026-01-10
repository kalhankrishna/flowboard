"use client"

import { useState, useEffect} from "react";
import { useDroppable, DndContext, DragOverlay } from '@dnd-kit/core';
import { useSortable, SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function Home() {
  const [activeId, setActiveId] = useState(null);
  const [cards, setCards] = useState([
    { id: '1', columnId: 'todo', title: 'Design homepage', description: 'Create mockups' },
    { id: '2', columnId: 'todo', title: 'Setup database', description: 'Create tables' },
    { id: '3', columnId: 'inprogress', title: 'Build API', description: 'REST endpoints for boards' },
    { id: '4', columnId: 'done', title: 'Project kickoff', description: 'Next.js setup' },
  ]);

  const [isMounted, setIsMounted] = useState(false);

  const columns = [
    { id: 'todo', title: 'To Do' },
    { id: 'inprogress', title: 'In Progress' },
    { id: 'done', title: 'Done' }
  ];

  let newCards = [...cards];

  function CardContent({card}: {card: {id: string; title: string; description: string}}) {
    return (
      <div>
        <h3 className="text-black">{card.title}</h3>
        {card.description && (
          <p className="text-gray-700">{card.description}</p>
        )}
      </div>
    );
  }

  function DroppableColumn({column, children}: {column: {id: string; title: string}, children: React.ReactNode}) {
    const { setNodeRef } = useDroppable({
      id: column.id
    });

    return (
      <div ref={setNodeRef} className="bg-gray-100 p-4 rounded-lg w-full min-h-140">
        <h2 className="font-semibold mb-4 text-black">{column.title}</h2>
        {children}
      </div>
    );
  }

  function SortableCard({card}: {card: {id: string; title: string; description: string}}) {
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

  const handleDragStart = (event: any) => {
    const {active} = event;
    
    setActiveId(active.id);
  }

  const handleDragOver = (event: any) => {
    const { active, over } = event;
    const overCard = cards.find(card => card.id === over?.id);
    const overColumn = columns.find(column => column.id === over?.id);

    if(!over || active.id === over.id) return;

    if(overCard){
      const activeIndex = newCards.findIndex(card => card.id === active.id);
      const overIndex = newCards.findIndex(card => card.id === over?.id);
      const columnId = overCard.columnId;

      if (activeIndex === -1 || overIndex === -1) return;

      newCards[activeIndex] = { ...newCards[activeIndex], columnId };
    }
    if(overColumn){
      const activeIndex = newCards.findIndex(card => card.id === active.id);

      if (activeIndex === -1) return;

      newCards[activeIndex] = { ...newCards[activeIndex], columnId: overColumn.id };
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const overCard = cards.find(card => card.id === over?.id);
    if(overCard){
      const activeCardIndex = cards.findIndex(card => card.id === active.id);
      const overCardIndex = cards.findIndex(card => card.id === over?.id);
      newCards = arrayMove(newCards, activeCardIndex, overCardIndex);
    }

    console.log('newCards:', newCards);
    setCards(newCards);

    setActiveId(null);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div>Loading...</div>;
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-8">Kanban Board</h1>
        <div className="flex gap-4 justify-between">
          {columns.map(column => {
            const columnCards = cards.filter(card => card.columnId === column.id);
            
            return (
              <DroppableColumn key={column.id} column={column}>
                <SortableContext 
                  items={columnCards.map(c => c.id)} 
                  strategy={verticalListSortingStrategy}
                >
                  {columnCards.map(card => (
                    <SortableCard key={card.id} card={card} />
                  ))}
                </SortableContext>
              </DroppableColumn>
            );
          })}
        </div>
      </div>
      <DragOverlay>
        {activeId ? <CardContent card={cards.find(card => card.id === activeId)!} /> : null}
      </DragOverlay>
    </DndContext>
  );
}