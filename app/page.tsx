"use client"

import { useState, useEffect, useId} from "react";
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove} from '@dnd-kit/sortable';
import DroppableColumn from "./components/DroppableColumn";
import SortableCard from "./components/SortableCard";
import CardContent from "./components/CardContent";
import CardModal from "./components/CardModal";

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

  const [cardModal, setCardModal] = useState<{ 
    open: boolean; 
    mode: 'add' | 'edit' | null;
    columnId: string | null;
    cardId: string | null;
  }>({
    open: false,
    mode: null,
    columnId: null,
    cardId: null
  });

  const id = useId();

  //Event Handlers

  function openAddCardModal(columnId: string) {
    setCardModal({ open: true, mode: 'add', columnId, cardId: null });
  }

  function openEditCardModal(cardId: string) {
    const container = findValueOfItems(cardId, 'item');
    setCardModal({ 
      open: true, 
      mode: 'edit', 
      columnId: container?.id || null, 
      cardId 
    });
  }

  function closeCardModal() {
    setCardModal({ open: false, mode: null, columnId: null, cardId: null });
  }

  function addCardToColumn(columnId: string, card: {id: string; title: string; description: string}) {
    setContainers(prevContainers => {
      return prevContainers.map(column => {
        if (column.id === columnId) {
          return {
            ...column,
            items: [...column.items, card]
          };
        }
        return column;
      });
    });
  }

  function editCard(cardId: string, updatedCard: { title: string; description: string }) {
    setContainers(prevContainers => {
      return prevContainers.map(column => ({
        ...column,
        items: column.items.map(item => 
          item.id === cardId 
            ? { ...item, ...updatedCard }
            : item
        )
      }));
    });
  }

  function deleteCard(cardId: string) {
    setContainers(prevContainers => {
      return prevContainers.map(column => ({
        ...column,
        items: column.items.filter(item => item.id !== cardId)
      }));
    });
  }

  //Drag Handlers

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


  //Helpers

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

  return (
    <DndContext id={id} onDragStart={handleDragStart} onDragMove={handleDragMove} onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-8">Kanban Board</h1>
        <div className="flex gap-4 justify-between">
          {
            containers.map(column => (
              <DroppableColumn key={column.id} column={column}>
                <SortableContext items={column.items.map(item => item.id)} strategy={verticalListSortingStrategy}>
                  {column.items.map(card => (
                    <SortableCard 
                      key={card.id} 
                      card={card} 
                      onEdit={openEditCardModal}
                      onDelete={deleteCard}
                    />
                  ))}
                </SortableContext>
                <button onClick={() => openAddCardModal(column.id)} className="mt-4 bg-green-500 text-white p-2 rounded w-full">Add Card</button>
              </DroppableColumn>
            ))
          }
        </div>
        {cardModal.open && cardModal.columnId && (
          <CardModal 
            mode={cardModal.mode!}
            columnId={cardModal.columnId}
            cardId={cardModal.cardId}
            existingCard={cardModal.cardId ? findItem(cardModal.cardId) : undefined}
            addCardToColumn={addCardToColumn}
            editCard={editCard}
            closeCardModal={closeCardModal}
          />
        )}
      </div>
      <DragOverlay>
        {activeId ? <CardContent card={findItem(activeId)!} /> : null}
      </DragOverlay>
    </DndContext>
  );
}