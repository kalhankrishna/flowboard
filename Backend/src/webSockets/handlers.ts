import { Server, Socket } from "socket.io";
import { getRoleByBoardId } from "../lib/permission.helper";
import { BoardRole } from "@prisma/client";

type SuccessResponse = {
  success: true;
  boardId: string;
  role: BoardRole;
};

type ErrorResponse = {
  success: false;
  error: string;
};

type RoomJoinResponse = SuccessResponse | ErrorResponse;

const roomPresence = new Map<string, Map<string, { userId: string; userName: string }>>();

export function registerBoardHandlers(io: Server, socket: Socket) {
    const userId = socket.data.userId as string;

    socket.on("BOARD_JOIN", async (boardId: string, callback: (response: RoomJoinResponse) => void) => {
        try{
            const role = await getRoleByBoardId(boardId, userId);
            if(!role){
                callback({ success: false, error: "Not authorized to join this board" });
                return;
            }
            await socket.join(`board:${boardId}`);

            const userName = socket.data.userName || 'Anonymous';

            if (!roomPresence.has(boardId)) {
                roomPresence.set(boardId, new Map());
            }

            let presenceMap = roomPresence.get(boardId);
            if(presenceMap && !presenceMap.has(socket.id)){
                presenceMap.set(socket.id, { userId, userName });
            }

            io.to(`board:${boardId}`).emit("USER_JOINED", presenceMap ? Array.from(presenceMap, ([socketId, user]) => ({...user, socketId})) : []);

            callback({ success: true, boardId, role });
        }
        catch(err){
            console.error(err);
            callback({ success: false, error: `Failed to join board: ${err}` });
        }
    });

    socket.on("BOARD_LEAVE", async (boardId: string) => {
        try {
            let presenceMap = roomPresence.get(boardId);
            if(presenceMap){
                presenceMap.delete(socket.id);
                io.to(`board:${boardId}`).emit("USER_LEFT", presenceMap ? Array.from(presenceMap, ([socketId, user]) => ({...user, socketId})) : []);
            }
            await socket.leave(`board:${boardId}`);
        } catch (err) {
            console.error("Error in BOARD_LEAVE:", err);
        }
    });

    socket.on("disconnect", () => {
        roomPresence.forEach((presenceMap, boardId) => {
            presenceMap.delete(socket.id);
            io.to(`board:${boardId}`).emit("USER_LEFT", presenceMap ? Array.from(presenceMap, ([socketId, user]) => ({...user, socketId})) : []);
        });
    });
}