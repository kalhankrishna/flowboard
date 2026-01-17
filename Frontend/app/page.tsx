"use client"

import { useState, useId, useEffect} from "react";
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove, horizontalListSortingStrategy} from '@dnd-kit/sortable';
import DroppableColumn from "./components/DroppableColumn";
import SortableCard from "./components/SortableCard";
import CardContent from "./components/CardContent";
import ColumnContent from "./components/ColumnContent";
import CardModal from "./components/CardModal";
import ColumnModal from "./components/ColumnModal";
import { getBoard, reorderCards, reorderColumns } from "@/lib/api";
import { Board, Column } from "@/types/board";
import { Card } from "@/types/board";

export default function Home() {
  const [board, setBoard] = useState<Board>({} as Board);
  const [activeId, setActiveId] = useState(null);

  const [containers, setContainers] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);

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
    const container = findValueOfItems(cardId, 'card');
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

  function addCardToColumn(columnId: string, card: Card) {
    setContainers(prevContainers => {
      return prevContainers.map(column => {
        if (column.id === columnId) {
          return {
            ...column,
            cards: [...column.cards, card]
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
        cards: column.cards.map(card => 
          card.id === cardId 
            ? { ...card, ...updatedCard }
            : card
        )
      }));
    });
  }

  function deleteCard(cardId: string) {
    setContainers(prevContainers => {
      return prevContainers.map(column => ({
        ...column,
        cards: column.cards.filter(item => item.id !== cardId)
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

  function addColumn(column: Column) {
    setContainers(prevContainers => [...prevContainers, {...column, cards: []}]);
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

    const activeContainer = findValueOfItems(active.id, 'card');
    const overContainer = findValueOfItems(over?.id, 'container') || findValueOfItems(over?.id, 'card');
    
    if (!activeContainer || !overContainer) return;

    const activeContainerIndex = containers.findIndex(c => c.id === activeContainer.id);
    const overContainerIndex = containers.findIndex(c => c.id === overContainer.id);
    
    const activeItemIndex = activeContainer.cards.findIndex(i => i.id === active.id);

    const isOverCard = findValueOfItems(over.id, 'card') !== undefined;
    const overItemIndex = isOverCard
      ? overContainer.cards.findIndex(i => i.id === over.id)
      : overContainer.cards.length;

    const isSameContainer = activeContainerIndex === overContainerIndex;
    const isSamePosition = isSameContainer && activeItemIndex === overItemIndex;
    
    if (isSamePosition) return;

    if(!isSameContainer){
      const newItems = [...containers];
      const [movedItem] = newItems[activeContainerIndex].cards.splice(activeItemIndex, 1);
      newItems[overContainerIndex].cards.splice(overItemIndex, 0, movedItem);
      setContainers(newItems);
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    const activeContainer = findValueOfItems(active.id, 'container') || findValueOfItems(active.id, 'card');
    const overContainer = findValueOfItems(over?.id, 'container') || findValueOfItems(over?.id, 'card');
    
    if (!activeContainer || !overContainer) {
      setActiveId(null);
      return;
    }

    // DEEP COPY - Snapshot state BEFORE any mutations
    const previousContainers = containers.map(col => ({
      ...col,
      cards: col.cards.map(card => ({ ...card }))
    }));

    const isActiveCard = findValueOfItems(active.id, 'card') !== undefined;

    // ==================== SCENARIO 1: Dragging a COLUMN ====================
    if (!isActiveCard && activeContainer.id !== overContainer.id) {
      const newContainers = arrayMove(
        containers,
        containers.findIndex(c => c.id === activeContainer.id),
        containers.findIndex(c => c.id === overContainer.id)
      );
      
      // Optimistic update - UI updates immediately
      setContainers(newContainers);
      
      // Persist to backend
      try {
        const columnPositions = newContainers.map((col, index) => ({
          id: col.id,
          position: index
        }));
        await reorderColumns(columnPositions);
        // Success - UI already updated, nothing more to do
      } catch (error) {
        console.error('Failed to reorder columns:', error);
        // Rollback to previous state
        setContainers(previousContainers);
        alert('Failed to reorder columns. Please try again.');
      }
      
      setActiveId(null);
      return;
    }

    // ==================== SCENARIO 2 & 3: Dragging a CARD ====================
    const activeItemIndex = activeContainer.cards.findIndex(i => i.id === active.id);
    const isOverCard = findValueOfItems(over.id, 'card') !== undefined;
    const overItemIndex = isOverCard
      ? overContainer.cards.findIndex(i => i.id === over.id)
      : overContainer.cards.length;
    
    // Same position in same column - no change needed
    if (activeItemIndex === overItemIndex && activeContainer.id === overContainer.id) {
      setActiveId(null);
      return;
    }

    const activeContainerIndex = containers.findIndex(c => c.id === activeContainer.id);
    const overContainerIndex = containers.findIndex(c => c.id === overContainer.id);
    
    // Create new state with moved card
    const newItems = containers.map(col => ({
      ...col,
      cards: [...col.cards]
    }));

    // Move the card
    const [movedCard] = newItems[activeContainerIndex].cards.splice(activeItemIndex, 1);
    newItems[overContainerIndex].cards.splice(overItemIndex, 0, movedCard);
    
    // Optimistic update - UI updates immediately
    setContainers(newItems);

    // Persist to backend
    try {
      const affectedColumns = [];
      
      // Source column (where card was removed from)
      affectedColumns.push({
        columnId: activeContainer.id,
        cards: newItems[activeContainerIndex].cards.map((card, index) => ({
          id: card.id,
          position: index
        }))
      });
      
      // Target column (where card was added to) - only if different from source
      if (activeContainer.id !== overContainer.id) {
        affectedColumns.push({
          columnId: overContainer.id,
          cards: newItems[overContainerIndex].cards.map((card, index) => ({
            id: card.id,
            position: index
          }))
        });
      }
      
      await reorderCards(affectedColumns);
      // Success - UI already updated, nothing more to do
    } catch (error) {
      console.error('Failed to reorder cards:', error);
      // Rollback to previous state
      setContainers(previousContainers);
      alert('Failed to move card. Please try again.');
    }

    setActiveId(null);
  };


  //Helpers

  function findItem(id: string) {
    const allItems = containers.flatMap(c => c.cards);
    const foundItem = allItems.find(item => item.id === id);
    return foundItem;
  }

  function findValueOfItems(id: string | undefined, type: string) {
    if (type === 'container') {
      return containers.find((item) => item.id === id);
    }
    if (type === 'card') {
      return containers.find((container) =>
        container.cards.find((card) => card.id === id),
      );
    }
  }

  const boardId = 'a770b5dc-8537-49fe-869d-7a0908f9b2d0';

  // Effects

  useEffect(() => {
    getBoard(boardId)
      .then(data => {
        setBoard(data);
        setContainers(data.columns);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load board:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8">Loading board...</div>;
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
                  <SortableContext items={column.cards.map(card => card.id)} strategy={verticalListSortingStrategy}>
                    {column.cards.map(card => (
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
            column={findValueOfItems(cardModal.columnId, 'container')!}
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
            board={board}
            columnId={columnModal.columnId}
            existingColumn={columnModal.columnId ? findValueOfItems(columnModal.columnId, 'container') : undefined}
            addColumnToState={addColumn}
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
              {findValueOfItems(activeId, 'container')?.cards.map(card => (
                <div key={card.id} className="bg-slate-300 rounded-md my-2 p-2 shadow-md">
                  <CardContent card={card} />
                </div>
              ))}
            </ColumnContent>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}