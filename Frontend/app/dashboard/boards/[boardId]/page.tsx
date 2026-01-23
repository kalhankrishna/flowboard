"use client"

import { useState, useId, useRef} from "react";
import { DndContext, DragEndEvent, DragMoveEvent, DragOverlay, DragStartEvent, UniqueIdentifier, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove, horizontalListSortingStrategy} from '@dnd-kit/sortable';
import DroppableColumn from "@/components/DroppableColumn";
import SortableCard from "@/components/SortableCard";
import CardContent from "@/components/CardContent";
import ColumnContent from "@/components/ColumnContent";
import CardModal from "@/components/CardModal";
import ColumnModal from "@/components/ColumnModal";
import { useBoard, useCards, useColumns } from "@/hooks";
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import LoadingOverlay from "@/components/LoadingOverlay";
import * as React from 'react'
import { Column } from "@/types/board";

export default function BoardPage({ params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = React.use(params);
  const id = useId();
  const queryClient = useQueryClient();

  const {getBoardQuery} = useBoard(boardId);
  const {data: board, isLoading, error} = getBoardQuery;
  const {addCardMutation, updateCardMutation, deleteCardMutation, handleReorderCards, isReordering: isReorderingCards, clearPendingReorder: clearCardReorder} = useCards(boardId);
  const { addColumnMutation, updateColumnMutation, deleteColumnMutation, handleReorderColumns, isReordering: isReorderingColumns, clearPendingReorder: clearColumnReorder } = useColumns(boardId);

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

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

  const dragOriginRef = useRef<{
    container: Column;
    itemIndex: number;
  } | null>(null);

  const isReordering = isReorderingCards || isReorderingColumns;

  //LOADING/ERROR STATES
  if (isLoading) {
    return <div className="p-8">Loading board...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error loading board: {error.message}</div>;
  }

  if (!board) {
    return <div className="p-8">Board not found</div>;
  }

  //Helpers
  function findItem(id: string) {
    if (!board || !id) return undefined;
    const allItems = board.columns.flatMap(c => c.cards);
    return allItems.find(item => item.id === id);
  }

  function findValueOfItems(id: string , type: string) {
    if (!board || !id) return undefined;
    
    if (type === 'container') {
      return board.columns.find((item) => item.id === id);
    }
    if (type === 'card') {
      return board.columns.find((container) =>
        container.cards.find((card) => card.id === id),
      );
    }
  }

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

  function handleAddCard(columnId: string, title: string, description: string | null, position: number) {
    addCardMutation.mutate({ columnId, title, description, position });
    closeCardModal();
  }

  function handleEditCard(cardId: string, title: string, description: string | null, position: number) {
    updateCardMutation.mutate({ id: cardId, title,  description, position });
    closeCardModal();
  }

  function handleDeleteCard(cardId: string) {
    if (window.confirm('Are you sure you want to delete this card?')) {
      deleteCardMutation.mutate(cardId);
    }
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

  function handleAddColumn(title: string, position: number) {
    addColumnMutation.mutate({ boardId, title, position });
    closeColumnModal();
  }

  function handleEditColumn(columnId: string, title: string, position: number) {
    updateColumnMutation.mutate({ id: columnId, title, position });
    closeColumnModal();
  }

  function handleDeleteColumn(columnId: string) {
    if (window.confirm('Are you sure you want to delete this column?')) {
      deleteColumnMutation.mutate(columnId);
    }
  }

  //Drag Handlers
  const handleDragStart = (event: DragStartEvent) => {
    const {active} = event;
    
    setActiveId(active.id);

    const activeContainer = findValueOfItems(active.id.toString(), 'card');
    if (activeContainer) {
      dragOriginRef.current = {
        container: activeContainer,
        itemIndex: activeContainer.cards.findIndex(i => i.id === active.id),
      };
    }
  }

  const handleDragMove = (event: DragMoveEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const activeContainer = findValueOfItems(active.id.toString(), 'card');
    const overContainer = findValueOfItems(over.id.toString(), 'container') || findValueOfItems(over.id.toString(), 'card');
    
    if (!activeContainer || !overContainer) return;

    const activeContainerIndex = board.columns.findIndex(c => c.id === activeContainer.id);
    const overContainerIndex = board.columns.findIndex(c => c.id === overContainer.id);
    
    const activeItemIndex = activeContainer.cards.findIndex(i => i.id === active.id);

    const isOverCard = findValueOfItems(over.id.toString(), 'card') !== undefined;
    const overItemIndex = isOverCard
      ? overContainer.cards.findIndex(i => i.id === over.id)
      : overContainer.cards.length;

    const isSameContainer = activeContainerIndex === overContainerIndex;
    const isSamePosition = isSameContainer && activeItemIndex === overItemIndex;
    
    if (isSamePosition) return;

    if(!isSameContainer){

      const newColumns = board.columns.map(col => ({
        ...col,
        cards: [...col.cards]
      }));
      
      const [movedCard] = newColumns[activeContainerIndex].cards.splice(activeItemIndex, 1);
      newColumns[overContainerIndex].cards.splice(overItemIndex, 0, movedCard);
      
      const newBoardState = {
        ...board,
        columns: newColumns
      };

      queryClient.setQueryData(queryKeys.board(boardId), newBoardState);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      dragOriginRef.current = null;
      return;
    }

    const isActiveCard = findValueOfItems(active.id.toString(), 'card') !== undefined;

    //SCENARIO 1: Dragging a COLUMN
    if (!isActiveCard) {
      const activeColumn = findValueOfItems(active.id.toString(), 'container');
      const overColumn = findValueOfItems(over.id.toString(), 'container');

      if (!activeColumn || !overColumn) {
        setActiveId(null);
        dragOriginRef.current = null;
        return;
      }

      if (activeColumn.id !== overColumn.id) {
        const oldIndex = board.columns.findIndex(c => c.id === activeColumn.id);
        const newIndex = board.columns.findIndex(c => c.id === overColumn.id);
        
        const newColumns = arrayMove(board.columns, oldIndex, newIndex);
        
        const newBoardState = {
          ...board,
          columns: newColumns
        };
        
        const columnPositions = newColumns.map((col, index) => ({
          id: col.id,
          position: index
        }));

        handleReorderColumns(newBoardState, columnPositions);
        
        setActiveId(null);
        dragOriginRef.current = null;
        return;
      }
    }

    //SCENARIO 2 & 3: Dragging a CARD
    if(!dragOriginRef.current){
      setActiveId(null);
      dragOriginRef.current = null;
      return;
    }
    const activeContainer = dragOriginRef.current.container;
    const overContainer = findValueOfItems(over.id.toString(), 'container') || findValueOfItems(over.id.toString(), 'card');
    
    if (!activeContainer || !overContainer) {
      setActiveId(null);
      dragOriginRef.current = null;
      return;
    }

    const activeItemIndexPrev = dragOriginRef.current.itemIndex;
    const activeItemIndexNew = overContainer.cards.findIndex(i => i.id === active.id);
    const overItemIndex = overContainer.cards.findIndex(i => i.id === over.id);

    const activeContainerIndex = board.columns.findIndex(c => c.id === activeContainer.id);
    const overContainerIndex = board.columns.findIndex(c => c.id === overContainer.id);
    
    const newColumns = board.columns.map(col => ({
      ...col,
      cards: [...col.cards]
    }));

    const newBoardState = {
      ...board,
      columns: newColumns
    };

    const affectedColumns = [];

    if(activeContainer.id === overContainer.id && active.id !== over.id) {
      if(activeContainer.id === over.id){
        setActiveId(null);
        dragOriginRef.current = null;
        return;
      }
      const reorderedCards = arrayMove(newColumns[activeContainerIndex].cards, activeItemIndexPrev, overItemIndex);
      newColumns[activeContainerIndex].cards = reorderedCards;

      affectedColumns.push({
        columnId: activeContainer.id,
        cards: reorderedCards.map((card, index) => ({
          id: card.id,
          position: index
        }))
      });

      handleReorderCards(newBoardState, affectedColumns);

      setActiveId(null);
      dragOriginRef.current = null;
      return;
    }

    if(activeContainer.id !== overContainer.id) {
      const reorderedCards = arrayMove(newColumns[overContainerIndex].cards, activeItemIndexNew, overItemIndex);
      newColumns[overContainerIndex].cards = reorderedCards;

      affectedColumns.push({
        columnId: overContainer.id,
        cards: reorderedCards.map((card, index) => ({
          id: card.id,
          position: index
        }))
      });

      affectedColumns.push({
        columnId: activeContainer.id,
        cards: newColumns[activeContainerIndex].cards.map((card, index) => ({
          id: card.id,
          position: index
        }))
      });

      handleReorderCards(newBoardState, affectedColumns);

      setActiveId(null);
      dragOriginRef.current = null;
      return;
    }
    setActiveId(null);
    dragOriginRef.current = null;
    return;
  };

  const handleDragCancel = () => {
    setActiveId(null);
    dragOriginRef.current = null;
    clearCardReorder();
    clearColumnReorder();
    queryClient.invalidateQueries({queryKey: queryKeys.board(boardId), refetchType: 'active', exact: true});
  };

  return (
    <DndContext id={id} onDragStart={handleDragStart} onDragMove={handleDragMove} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel} collisionDetection={closestCorners}>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-2">Kanban Board</h1>
        <div className="flex justify-end">
          <button onClick={openAddColumnModal} className="mb-4 bg-green-500 text-white p-2 rounded w-full max-w-40">Add Column</button>
        </div>
        <div className="flex gap-4 justify-between">
          <SortableContext items={board.columns.map(column => column.id)} strategy={horizontalListSortingStrategy}>
            {
              board.columns.map(column => (
                <DroppableColumn key={column.id} column={column} onAddCard={openAddCardModal} onEdit={openEditColumnModal} onDelete={handleDeleteColumn} isAddPending={addColumnMutation.isPending} isEditPending={updateColumnMutation.isPending} isDeletePending={deleteColumnMutation.isPending}>
                  <SortableContext items={column.cards.map(card => card.id)} strategy={verticalListSortingStrategy}>
                    {column.cards.map(card => (
                      <SortableCard 
                        key={card.id} 
                        card={card} 
                        onEdit={openEditCardModal}
                        onDelete={handleDeleteCard}
                        isAddPending={addCardMutation.isPending}
                        isEditPending={updateCardMutation.isPending}
                        isDeletePending={deleteCardMutation.isPending}
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
            onAddCard={handleAddCard}
            onEditCard={handleEditCard}
            closeCardModal={closeCardModal}
            isAddPending={addCardMutation.isPending}
            isEditPending={updateCardMutation.isPending}
            isDeletePending={deleteCardMutation.isPending}
          />
        )}
        {columnModal.open && (
          <ColumnModal 
            mode={columnModal.mode!}
            board={board}
            columnId={columnModal.columnId}
            existingColumn={columnModal.columnId ? findValueOfItems(columnModal.columnId, 'container') : undefined}
            onAddColumn={handleAddColumn}
            onEditColumn={handleEditColumn}
            closeColumnModal={closeColumnModal}
            isAddPending={addColumnMutation.isPending}
            isEditPending={updateColumnMutation.isPending}
            isDeletePending={deleteColumnMutation.isPending}
          />
        )}
      </div>
      <DragOverlay>
        {activeId && findItem(activeId.toString()) && (
          <div className="bg-slate-300 rounded-md my-2 p-2 shadow-md opacity-50">
            <CardContent card={findItem(activeId.toString())!} />
          </div>
        )}

        {activeId && findValueOfItems(activeId.toString(), 'container') && (
          <div className="bg-gray-100 p-4 rounded-lg w-full min-h-140 shadow-md opacity-50">
            <ColumnContent column={findValueOfItems(activeId.toString(), 'container')!}>
              {findValueOfItems(activeId.toString(), 'container')?.cards.map(card => (
                <div key={card.id} className="bg-slate-300 rounded-md my-2 p-2 shadow-md">
                  <CardContent card={card} />
                </div>
              ))}
            </ColumnContent>
          </div>
        )}
      </DragOverlay>

      {isReordering && <LoadingOverlay message="Saving changes..." />}
    </DndContext>
  );
}