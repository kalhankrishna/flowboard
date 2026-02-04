import { Socket, Server } from "socket.io";
import { getRoleByBoardId, hasSufficientRole } from "../lib/permission.helper";

type SuccessResponse = {
  success: true;
  cardId: string;
};

type ErrorResponse = {
  success: false;
  error: string;
};

type CardLockResponse = SuccessResponse | ErrorResponse;

const cardLocks = new Map<string, {boardId: string, cardId: string}>();

export function registerCardLockHandlers(io: Server, socket: Socket) {
    const userId = socket.data.userId as string;

    socket.on("CARD_LOCK", async ({boardId, cardId}: {boardId: string, cardId: string}, callback: (response: CardLockResponse) => void) => {
        try {
            const role = await getRoleByBoardId(boardId, userId);
            if (!role || !hasSufficientRole(role, "EDITOR")) {
                callback({ success: false, error: "Not authorized to lock this card" });
                return;
            }

            cardLocks.set(socket.id, {boardId: boardId, cardId: cardId});

            socket.to(`board:${boardId}`).emit("CARD_LOCKED", { cardId, userId });

            callback({ success: true, cardId });

        } catch (err) {
            console.error(err);
            callback({ success: false, error: `Failed to lock card: ${err}` });
        }
    });

    socket.on("CARD_UNLOCK", async ({boardId, cardId}: {boardId: string, cardId: string}, callback: (response: CardLockResponse) => void) => {
        try{
            const lock = cardLocks.get(socket.id);
            if(lock){
                cardLocks.delete(socket.id);
                socket.to(`board:${boardId}`).emit("CARD_UNLOCKED", { cardId, userId });
            }
            callback({ success: true, cardId });
        } catch (err) {
            console.error(err);
            callback({ success: false, error: `Failed to unlock card: ${err}` });
        }
    });

    socket.on("disconnect", () => {
        const lock = cardLocks.get(socket.id);
        if(lock){
            socket.to(`board:${lock.boardId}`).emit("CARD_UNLOCKED", { cardId: lock.cardId, userId });
            cardLocks.delete(socket.id);
        }
    });
}