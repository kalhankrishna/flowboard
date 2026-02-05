import { Socket, Server } from "socket.io";
import { Card } from "@prisma/client";
import { ReorderCardsInput } from "../schemas/card.schema";

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
}