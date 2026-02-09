"use client"

import { useState, useId} from "react";
import { DndContext, DragCancelEvent, DragEndEvent, DragMoveEvent, DragOverEvent, DragOverlay, DragStartEvent, UniqueIdentifier, pointerWithin } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove, horizontalListSortingStrategy} from '@dnd-kit/sortable';
import DroppableColumn from "@/components/DroppableColumn";
import SortableCard from "@/components/SortableCard";
import CardContent from "@/components/CardContent";
import ColumnContent from "@/components/ColumnContent";
import CardModal from "@/components/CardModal";
import ColumnModal from "@/components/ColumnModal";
import { PresenceIndicator } from "@/components/PresenceIndicator";
import RemoteDragOverlay from "@/components/RemoteDragOverlay";
import { useBoard, useCards, useColumns, useSharing, useBoardRoom, useLock, useLockListeners, useUpdateListeners, useDragBroadcasts, useDragListeners } from "@/hooks";
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import * as React from 'react'
import { Card, Column, ReorderCard, ReorderColumn } from "@/types/board";
import ShareModal from '@/components/ShareModal';
import { useAuthStore } from '@/store/authStore';
import { BoardRole } from '@/types/share';
import { PointerSensor, KeyboardSensor, useSensor, useSensors } from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

export default function BoardPage({ params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = React.use(params);

  const { isInRoom, roomError } = useBoardRoom(boardId);
  const { lockResource, unlockResource } = useLock();
  const lockedResources = useLockListeners(boardId);
  const { dragStartBroadcast, dragOverBroadcast, dragEndBroadcast } = useDragBroadcasts();
  const remoteDrags = useDragListeners(boardId);
  useUpdateListeners(boardId);

  const id = useId();
  const queryClient = useQueryClient();

  const {getBoardQuery} = useBoard(boardId);
  const {data: board, isLoading, error} = getBoardQuery;
  const {addCardMutation, updateCardMutation, deleteCardMutation, reorderCardsMutation} = useCards(boardId);
  const { addColumnMutation, updateColumnMutation, deleteColumnMutation, reorderColumnsMutation } = useColumns(boardId);

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

  const [shareModalOpen, setShareModalOpen] = useState(false);

  const user = useAuthStore((state) => state.user);

  const { getCollaboratorsQuery } = useSharing(boardId);
  const { data: collaborators } = getCollaboratorsQuery;

  const getUserRole = (): BoardRole | null => {
    if (!user || !collaborators) return null;
    const access = collaborators.find(c => c.userId === user.userId);
    return access?.role || null;
  };

  const userRole = getUserRole();

  const isOwner = userRole === 'OWNER';
  const canEdit = userRole === 'OWNER' || userRole === 'EDITOR';

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: canEdit ? 5 : 999999 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const remoteDraggedCards: Card[] = [];
  const remoteDraggedColumns: Column[] = [];

  remoteDrags.forEach((_, resourceId) => {
    if (findCard(resourceId)) {
      const card = findCard(resourceId);
      if (card) remoteDraggedCards.push(card);
    }
    if (findContainer(resourceId, 'container')) {
      const column = findContainer(resourceId, 'container');
      if (column) remoteDraggedColumns.push(column);
    }
  });

  const isPendingAnyMutation = (addCardMutation.isPending || updateCardMutation.isPending || deleteCardMutation.isPending || 
  addColumnMutation.isPending || updateColumnMutation.isPending || deleteColumnMutation.isPending || 
  reorderCardsMutation.isPending || reorderColumnsMutation.isPending);

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
  function findCard(id: string) {
    if (!board || !id) return undefined;
    const allItems = board.columns.flatMap(c => c.cards);
    return allItems.find(item => item.id === id);
  }

  function findContainer(id: string , type: string) {
    if (!board || !id) return undefined;
    
    if (type === 'container') {
      return board.columns.find((item) => item.id === id);
    }
    if (type === 'card') {
      return board.columns.find((container) =>
        container.cards.find((card) => card.id === id)
      );
    }
  }

  //Event Handlers
  function openAddCardModal(columnId: string) {
    setCardModal({ open: true, mode: 'add', columnId, cardId: null });
  }

  function openEditCardModal(cardId: string) {
    const container = findContainer(cardId, 'card');
    setCardModal({ 
      open: true, 
      mode: 'edit', 
      columnId: container?.id || null, 
      cardId 
    });
    lockResource({boardId, resourceId: cardId});
  }

  function closeCardModal() {
    setCardModal({ open: false, mode: null, columnId: null, cardId: null });
  }

  function handleAddCard(columnId: string, title: string, description: string | null, position: string) {
    addCardMutation.mutate({ columnId, title, description, position });
    closeCardModal();
  }

  function handleEditCard(cardId: string, title: string, description: string | null, position: string) {
    updateCardMutation.mutate({ id: cardId, title,  description, position });
    unlockResource({boardId, resourceId: cardId});
    closeCardModal();
  }

  function handleDeleteCard(cardId: string) {
    lockResource({boardId, resourceId: cardId});
    if (window.confirm('Are you sure you want to delete this card?')) {
      deleteCardMutation.mutate(cardId);
    }
    unlockResource({boardId, resourceId: cardId});
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
    lockResource({boardId, resourceId: columnId});
  }

  function closeColumnModal() {
    setColumnModal({ open: false, mode: null, columnId: null });
  }

  function handleAddColumn(title: string, position: string) {
    addColumnMutation.mutate({ boardId, title, position });
    closeColumnModal();
  }

  function handleEditColumn(columnId: string, title: string, position: string) {
    updateColumnMutation.mutate({ id: columnId, title, position });
    unlockResource({boardId, resourceId: columnId});
    closeColumnModal();
  }

  function handleDeleteColumn(columnId: string) {
    lockResource({boardId, resourceId: columnId});
    if (window.confirm('Are you sure you want to delete this column?')) {
      deleteColumnMutation.mutate(columnId);
    }
    unlockResource({boardId, resourceId: columnId});
  }

  //Drag Handlers
  const handleDragStart = (event: DragStartEvent) => {
    const {active} = event;
    
    setActiveId(active.id);
    lockResource({ boardId, resourceId: active.id.toString() });
    dragStartBroadcast({ boardId, resourceId: active.id.toString() });
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const currentRect = active.rect.current.translated;
    if(!currentRect) return;
    const finalX = currentRect.left;
    const finalY = currentRect.top;

    dragOverBroadcast({ boardId, resource: { resourceId: active.id.toString(), x: finalX, y: finalY } });

    const isActiveCard = findContainer(active.id.toString(), 'card') !== undefined;

    if(!isActiveCard){
      const activeColumn = findContainer(active.id.toString(), 'container');
      const overColumn = findContainer(over.id.toString(), 'container');

      if (!activeColumn || !overColumn) return;

      if (activeColumn.id !== overColumn.id) {
        const oldIndex = board.columns.findIndex(c => c.id === activeColumn.id);
        const newIndex = board.columns.findIndex(c => c.id === overColumn.id);
        
        const newColumns = arrayMove(board.columns, oldIndex, newIndex);
        
        const newBoardState = {
          ...board,
          columns: newColumns
        };
        requestAnimationFrame(() => {queryClient.setQueryData(queryKeys.board(boardId), newBoardState);});
        return;
      }
    }

    const activeContainer = findContainer(active.id.toString(), 'card');
    const overContainer = findContainer(over.id.toString(), 'container') || findContainer(over.id.toString(), 'card');
    
    if (!activeContainer || !overContainer) return;

    const activeContainerIndex = board.columns.findIndex(c => c.id === activeContainer.id);
    const overContainerIndex = board.columns.findIndex(c => c.id === overContainer.id);
    
    const activeItemIndex = activeContainer.cards.findIndex(i => i.id === active.id);

    const isOverCard = findContainer(over.id.toString(), 'card') !== undefined;
    const overItemIndex = isOverCard
      ? overContainer.cards.findIndex(i => i.id === over.id)
      : overContainer.cards.length;

    const isSameContainer = activeContainerIndex === overContainerIndex;

    const newColumns = board.columns.map(col => ({
      ...col,
      cards: [...col.cards]
    }));

    const newBoardState = {
      ...board,
      columns: newColumns
    };
    
    if(isSameContainer){
      if(!isOverCard){
        const overIndex = overContainer.cards.length - 1;
        const movedCard = arrayMove(activeContainer.cards, activeItemIndex, overIndex);
        newColumns[activeContainerIndex].cards = movedCard;
        
        requestAnimationFrame(() => {queryClient.setQueryData(queryKeys.board(boardId), newBoardState);});
        return;
      }
      const movedCard = arrayMove(activeContainer.cards, activeItemIndex, overItemIndex);
      newColumns[activeContainerIndex].cards = movedCard;

      requestAnimationFrame(() => {queryClient.setQueryData(queryKeys.board(boardId), newBoardState);});
    }
    else {
      const [movedCard] = newColumns[activeContainerIndex].cards.splice(activeItemIndex, 1);
      newColumns[overContainerIndex].cards.splice(overItemIndex, 0, movedCard);

      requestAnimationFrame(() => {queryClient.setQueryData(queryKeys.board(boardId), newBoardState);});
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    dragEndBroadcast({ boardId, resourceId: active.id.toString() });

    const isActiveCard = findContainer(active.id.toString(), 'card') !== undefined;

    //SCENARIO 1: Dragging a COLUMN
    if (!isActiveCard) {
      const activeColumn = findContainer(active.id.toString(), 'container');

      if (!activeColumn) {
        setActiveId(null);
        unlockResource({ boardId, resourceId: active.id.toString() });
        return;
      }

      const activeColumnIndex = board.columns.findIndex(col => col.id === activeColumn.id);

      const reorderedColumnData: ReorderColumn = {
        columnId: activeColumn.id,
        prevColumnId: activeColumnIndex !== 0 ? board.columns[activeColumnIndex-1].id : null,
        nextColumnId: activeColumnIndex < board.columns.length - 1 ? board.columns[activeColumnIndex + 1].id : null,
        boardId: board.id
      };
      reorderColumnsMutation.mutate(reorderedColumnData);
      
      setActiveId(null);
      unlockResource({ boardId, resourceId: active.id.toString() });
      return;
    }

    //SCENARIO 2: Dragging a CARD
    const activeColumn = findContainer(active.id.toString(), 'card');
    if(!activeColumn){
      setActiveId(null);
      //dragOriginRef.current = null;
      unlockResource({ boardId, resourceId: active.id.toString() });
      return;
    }
    const activeCardIndex = activeColumn.cards.findIndex(i => i.id === active.id);

    const reorderedCardData: ReorderCard = {
      cardId: active.id.toString(),
      columnId: activeColumn.id,
      prevCardId: activeCardIndex !== 0 ? activeColumn.cards[activeCardIndex - 1].id : null,
      nextCardId: activeCardIndex < activeColumn.cards.length - 1 ? activeColumn.cards[activeCardIndex + 1].id : null,
    }

    reorderCardsMutation.mutate(reorderedCardData);

    setActiveId(null);
    unlockResource({ boardId, resourceId: active.id.toString() });
  };

  const handleDragCancel = (event: DragCancelEvent) => {
    const {active} = event;
    setActiveId(null);
    unlockResource({ boardId, resourceId: active.id.toString() });
    dragEndBroadcast({ boardId, resourceId: active.id.toString() });
    queryClient.invalidateQueries({queryKey: queryKeys.board(boardId), refetchType: 'active', exact: true});
  };

  return (
    <DndContext id={id} sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel} collisionDetection={pointerWithin}>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-2">Kanban Board</h1>
        <div className="flex justify-end">
          {isOwner && (
            <button
              onClick={() => setShareModalOpen(true)}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
            >
              Share
            </button>
          )}
          {
            canEdit && (
              <button onClick={openAddColumnModal} disabled={isPendingAnyMutation} className="mb-4 bg-green-500 text-white p-2 rounded w-full max-w-40">Add Column</button>
            )
          }
          <PresenceIndicator boardId={boardId} />
        </div>
        <div className="flex gap-4 justify-between">
          <SortableContext items={board.columns.map(column => column.id)} strategy={horizontalListSortingStrategy}>
            {
              board.columns.map(column => (
                <DroppableColumn key={column.id} canEdit={canEdit} column={column} isLocked={lockedResources.has(column.id)} lockedBy={lockedResources.get(column.id)} onAddCard={openAddCardModal} onEdit={openEditColumnModal} onDelete={handleDeleteColumn} isPending={isPendingAnyMutation}>
                  <SortableContext items={column.cards.map(card => card.id)} strategy={verticalListSortingStrategy}>
                    {column.cards.map(card => (
                      <SortableCard 
                        key={card.id}
                        canEdit={canEdit} 
                        card={card}
                        isLocked={lockedResources.has(card.id)}
                        lockedBy={lockedResources.get(card.id)} 
                        onEdit={openEditCardModal}
                        onDelete={handleDeleteCard}
                        isPending={isPendingAnyMutation}
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
            column={findContainer(cardModal.columnId, 'container')!}
            cardId={cardModal.cardId}
            existingCard={cardModal.cardId ? findCard(cardModal.cardId) : undefined}
            onAddCard={handleAddCard}
            onEditCard={handleEditCard}
            closeCardModal={closeCardModal}
            isPending={isPendingAnyMutation}
          />
        )}
        {columnModal.open && (
          <ColumnModal 
            mode={columnModal.mode!}
            board={board}
            columnId={columnModal.columnId}
            existingColumn={columnModal.columnId ? findContainer(columnModal.columnId, 'container') : undefined}
            onAddColumn={handleAddColumn}
            onEditColumn={handleEditColumn}
            closeColumnModal={closeColumnModal}
            isPending={isPendingAnyMutation}
          />
        )}
        {shareModalOpen && (
          <ShareModal
            boardId={boardId}
            onClose={() => setShareModalOpen(false)}
          />
        )}
      </div>
      <RemoteDragOverlay remoteDrags={remoteDrags} cards={remoteDraggedCards} columns={remoteDraggedColumns} />
      <DragOverlay>
        {activeId && findCard(activeId.toString()) && (
          <div className="bg-slate-300 rounded-md my-2 p-2 shadow-md opacity-50">
            <CardContent card={findCard(activeId.toString())!} />
          </div>
        )}

        {activeId && findContainer(activeId.toString(), 'container') && (
          <div className="bg-gray-100 p-4 rounded-lg w-full min-h-140 shadow-md opacity-50">
            <ColumnContent column={findContainer(activeId.toString(), 'container')!}>
              {findContainer(activeId.toString(), 'container')?.cards.map(card => (
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