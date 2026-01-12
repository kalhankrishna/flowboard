"use client"

import { useState, useId} from "react";
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove, horizontalListSortingStrategy} from '@dnd-kit/sortable';
import DroppableColumn from "./components/DroppableColumn";
import SortableCard from "./components/SortableCard";
import CardContent from "./components/CardContent";
import ColumnContent from "./components/ColumnContent";
import CardModal from "./components/CardModal";
import ColumnModal from "./components/ColumnModal";

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

  const [columnModal, setColumnModal] = useState<{ 
    open: boolean; 
    mode: 'add' | 'edit' | null;
    columnId: string | null;
  }>({
    open: false,
    mode: null,
    columnId: null
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

  function openAddColumnModal() {
    setColumnModal({ open: true, mode: 'add', columnId: null });
  }

  function openEditColumnModal(columnId: string) {
    setColumnModal({ 
      open: true, 
      mode: 'edit', 
      columnId: columnId, 
    });
  }

  function closeColumnModal() {
    setColumnModal({ open: false, mode: null, columnId: null });
  }

  function addColumn(column: {id: string; title: string}) {
    setContainers(prevContainers => [...prevContainers, {...column, items: []}]);
  }

  function editColumn(columnId: string, updatedColumn: { title: string}) {
    setContainers(prevContainers => (
      prevContainers.map(column => 
        column.id === columnId 
          ? { ...column, ...updatedColumn } 
          : column
      )
    ));
  }

  function deleteColumn(columnId: string) {
    setContainers(prevContainers => (
      prevContainers.filter(column => 
        column.id !== columnId
      )
    ));
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

    const isOverCard = findValueOfItems(over.id, 'item') !== undefined;
    const overItemIndex = isOverCard
      ? overContainer.items.findIndex(i => i.id === over.id)
      : overContainer.items.length;

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

    const activeContainer = findValueOfItems(active.id, 'container') ||findValueOfItems(active.id, 'item');
    const overContainer = findValueOfItems(over?.id, 'container') || findValueOfItems(over?.id, 'item');
    
    if (!activeContainer || !overContainer) {
      setActiveId(null);
      return;
    }

    const activeItemIndex = activeContainer.items.findIndex(i => i.id === active.id);
    const isOverCard = findValueOfItems(over.id, 'item') !== undefined;
    const isActiveCard = findValueOfItems(active.id, 'item') !== undefined;

    if(!isActiveCard && activeContainer.id !== overContainer.id){
      setContainers(prevContainers => (
        arrayMove(prevContainers,
          prevContainers.findIndex(c => c.id === activeContainer.id),
          prevContainers.findIndex(c => c.id === overContainer.id)
        )
      ));
      setActiveId(null);
      return;
    }

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
        <h1 className="text-2xl font-bold mb-2">Kanban Board</h1>
        <div className="flex justify-end">
          <button onClick={openAddColumnModal} className="mb-4 bg-green-500 text-white p-2 rounded w-full max-w-40">Add Column</button>
        </div>
        <div className="flex gap-4 justify-between">
          <SortableContext items={containers.map(column => column.id)} strategy={horizontalListSortingStrategy}>
            {
              containers.map(column => (
                <DroppableColumn key={column.id} column={column} onAddCard={openAddCardModal} onEdit={openEditColumnModal} onDelete={deleteColumn}>
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
                </DroppableColumn>
              ))
            }
          </SortableContext>
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
        {columnModal.open && (
          <ColumnModal 
            mode={columnModal.mode!}
            columnId={columnModal.columnId}
            existingColumn={columnModal.columnId ? findValueOfItems(columnModal.columnId, 'container') : undefined}
            addColumn={addColumn}
            editColumn={editColumn}
            closeColumnModal={closeColumnModal}
          />
        )}
      </div>
      <DragOverlay>
        {activeId && findItem(activeId) && (
          <div className="bg-slate-300 rounded-md my-2 p-2 shadow-md opacity-50">
            <CardContent card={findItem(activeId)!} />
          </div>
        )}

        {activeId && findValueOfItems(activeId, 'container') && (
          <div className="bg-gray-100 p-4 rounded-lg w-full min-h-140 shadow-md opacity-50">
            <ColumnContent column={findValueOfItems(activeId, 'container')!}>
              {findValueOfItems(activeId, 'container')?.items.map(item => (
                <div key={item.id} className="bg-slate-300 rounded-md my-2 p-2 shadow-md">
                  <CardContent card={item} />
                </div>
              ))}
            </ColumnContent>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}