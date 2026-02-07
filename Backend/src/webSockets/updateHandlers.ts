import { Socket, Server } from "socket.io";
import { Card, Column } from "@prisma/client";
import { ReorderCardsInput } from "../schemas/card.schema";
import { ReorderColumnsInput } from "../schemas/column.schema";
type SuccessResponse = {
  success: true;
  resourceId: string;
};

type ErrorResponse = {
  success: false;
  error: string;
};

type UpdateResponse = SuccessResponse | ErrorResponse;

export function registerUpdateHandlers(io: Server, socket: Socket) {
    socket.on("ADD_CARD", async ({boardId, columnId, card}: {boardId: string, columnId: string, card: Card}, callback: (response: UpdateResponse) => void) => {
        try{
            socket.to(`board:${boardId}`).emit("CARD_ADDED", { columnId, card } );
            callback({ success: true, resourceId: card.id });
        }
        catch (err) {
            console.error(err);
            callback({ success: false, error: `Failed to broadcast add card: ${err}` });
        }
    });

    socket.on("UPDATE_CARD", async ({boardId, updatedCard}: {boardId: string, updatedCard: Card}, callback: (response: UpdateResponse) => void) => {
        try{
            socket.to(`board:${boardId}`).emit("CARD_UPDATED", updatedCard );
            callback({ success: true, resourceId: updatedCard.id });
        }
        catch (err) {
            console.error(err);
            callback({ success: false, error: `Failed to broadcast update card: ${err}` });
        }
    });

    socket.on("DELETE_CARD", async ({boardId, cardId}: {boardId: string, cardId: string}, callback: (response: UpdateResponse) => void) => {
        try{
            socket.to(`board:${boardId}`).emit("CARD_DELETED", cardId );
            callback({ success: true, resourceId: cardId });
        }
        catch (err) {
            console.error(err);
            callback({ success: false, error: `Failed to broadcast delete card: ${err}` });
        }
    });

    socket.on("REORDER_CARDS", async ({boardId, reorderData}: {boardId: string, reorderData: ReorderCardsInput}, callback: (response: UpdateResponse) => void) => {
        try{
            socket.to(`board:${boardId}`).emit("CARDS_REORDERED", reorderData );
            callback({ success: true, resourceId: boardId });
        }
        catch (err) {
            console.error(err);
            callback({ success: false, error: `Failed to broadcast reorder cards: ${err}` });
        }
    });

    socket.on("ADD_COLUMN", async ({boardId, column}: {boardId: string, column: Column}, callback: (response: UpdateResponse) => void) => {
        try{
            socket.to(`board:${boardId}`).emit("COLUMN_ADDED", column );
            callback({ success: true, resourceId: column.id });
        }
        catch (err) {
            console.error(err);
            callback({ success: false, error: `Failed to broadcast add column: ${err}` });
        }
    });

    socket.on("UPDATE_COLUMN", async ({boardId, updatedColumn}: {boardId: string, updatedColumn: Column}, callback: (response: UpdateResponse) => void) => {
        try{
            socket.to(`board:${boardId}`).emit("COLUMN_UPDATED", updatedColumn );
            callback({ success: true, resourceId: updatedColumn.id });
        }
        catch (err) {
            console.error(err);
            callback({ success: false, error: `Failed to broadcast update column: ${err}` });
        }
    });

    socket.on("DELETE_COLUMN", async ({boardId, columnId}: {boardId: string, columnId: string}, callback: (response: UpdateResponse) => void) => {
        try{
            socket.to(`board:${boardId}`).emit("COLUMN_DELETED", columnId );
            callback({ success: true, resourceId: columnId });
        }
        catch (err) {
            console.error(err);
            callback({ success: false, error: `Failed to broadcast delete column: ${err}` });
        }
    });

    socket.on("REORDER_COLUMNS", async ({boardId, reorderData}: {boardId: string, reorderData: ReorderColumnsInput}, callback: (response: UpdateResponse) => void) => {
        try{
            socket.to(`board:${boardId}`).emit("COLUMNS_REORDERED", reorderData );
            callback({ success: true, resourceId: boardId });
        }
        catch (err) {
            console.error(err);
            callback({ success: false, error: `Failed to broadcast reorder columns: ${err}` });
        }
    });
}