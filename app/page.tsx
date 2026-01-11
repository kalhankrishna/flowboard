"use client"

import { useState, useEffect} from "react";
import { useDroppable, DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { useSortable, SortableContext, verticalListSortingStrategy, arrayMove} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function Home() {
  const [activeId, setActiveId] = useState(null);

  const [containers, setContainers] = useState([
    {
      id: 'todo',
      title: 'To Do',
      items: [
        { id: '1', title: 'Design homepage', description: 'Create mockups' },
        { id: '2', title: 'Setup database', description: 'Create tables' },
        { id: '3', title: 'Build API', description: 'REST endpoints for boards' },
      ]
    },
    {
      id: 'inprogress',
      title: 'In Progress',
      items: [
        {id: '4', title: 'Implement draggability', description: 'Understand Dnd-kit' },
        {id: '5', title: 'Restructure containers', description: 'Use nested initial data in state' },
      ]
    },
    {
      id: 'done',
      title: 'Done',
      items: [
        { id: '6', title: 'Project kickoff', description: 'Next.js setup' },
        {id: '7', title: 'Initial commit', description: 'Setup repository' },
      ]
    }
  ]);

  const [isMounted, setIsMounted] = useState(false);

  function DroppableColumn({column, children}: {column: {id: string; title: string; items: {id: string; title: string; description: string}[]}, children: React.ReactNode}) {
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

  const handleDragMove = (event: any) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const activeContainer = findValueOfItems(active.id, 'item');
    const overContainer = findValueOfItems(over?.id, 'container') || findValueOfItems(over?.id, 'item');
    
    if (!activeContainer || !overContainer) return;

    const activeContainerIndex = containers.findIndex(c => c.id === activeContainer.id);
    const overContainerIndex = containers.findIndex(c => c.id === overContainer.id);
    
    const activeItemIndex = activeContainer.items.findIndex(i => i.id === active.id);
    
    // FIX: Check if over.id is a card or a column
    const isOverCard = findValueOfItems(over.id, 'item') !== undefined;
    const overItemIndex = isOverCard
      ? overContainer.items.findIndex(i => i.id === over.id)
      : overContainer.items.length; // Insert at end if over empty column space
    
    // OPTIMIZATION: Check if anything actually changed
    const isSameContainer = activeContainerIndex === overContainerIndex;
    const isSamePosition = isSameContainer && activeItemIndex === overItemIndex;
    
    if (isSamePosition) return;

    if(!isSameContainer){
      const newItems = [...containers];
      const [movedItem] = newItems[activeContainerIndex].items.splice(activeItemIndex, 1);
      newItems[overContainerIndex].items.splice(overItemIndex, 0, movedItem);
      setContainers(newItems);
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    const activeContainer = findValueOfItems(active.id, 'item');
    const overContainer = findValueOfItems(over?.id, 'container') || findValueOfItems(over?.id, 'item');
    
    if (!activeContainer || !overContainer) {
      setActiveId(null);
      return;
    }

    const activeItemIndex = activeContainer.items.findIndex(i => i.id === active.id);
    const isOverCard = findValueOfItems(over.id, 'item') !== undefined;
    const overItemIndex = isOverCard
      ? overContainer.items.findIndex(i => i.id === over.id)
      : overContainer.items.length;
    
    // Only update if item isn't already in correct position
    if (activeItemIndex !== overItemIndex) {
      const activeContainerIndex = containers.findIndex(c => c.id === activeContainer.id);
      const newItems = [...containers];
      newItems[activeContainerIndex].items = arrayMove(
        newItems[activeContainerIndex].items,
        activeItemIndex,
        overItemIndex
      );
      setContainers(newItems);
    }

    setActiveId(null);
  };

  function findItem(id: string) {
    const allItems = containers.flatMap(c => c.items);
    const foundItem = allItems.find(item => item.id === id);
    return foundItem;
  }

  function findValueOfItems(id: string | undefined, type: string) {
    if (type === 'container') {
      return containers.find((item) => item.id === id);
    }
    if (type === 'item') {
      return containers.find((container) =>
        container.items.find((item) => item.id === id),
      );
    }
  }

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div>Loading...</div>;
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragMove={handleDragMove} onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-8">Kanban Board</h1>
        <div className="flex gap-4 justify-between">
          {
            containers.map(column => (
              <DroppableColumn key={column.id} column={column}>
                <SortableContext items={column.items.map(item => item.id)} strategy={verticalListSortingStrategy}>
                  {
                    column.items.map(card => (
                      <SortableCard key={card.id} card={card} />
                    ))
                  }
                </SortableContext>
              </DroppableColumn>
            ))
          }
        </div>
      </div>
      <DragOverlay>
        {activeId ? <CardContent card={findItem(activeId)!} /> : null}
      </DragOverlay>
    </DndContext>
  );
}