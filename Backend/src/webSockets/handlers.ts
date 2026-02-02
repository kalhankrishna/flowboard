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

export function registerBoardHandlers(io: Server, socket: Socket) {
    const userId = socket.data.userId as string;

    socket.on("BOARD_JOIN", async (boardId: string, callback: (response: RoomJoinResponse) => void) => {
        try{
            const role = await getRoleByBoardId(boardId, userId);
            if(!role){
                callback({ success: false, error: "Not authorized to join this board" });
                return;
            }
            await socket.join(boardId);
            callback({ success: true, boardId, role });
        }
        catch(err){
            console.error(err);
            callback({ success: false, error: `Failed to join board: ${err}` });
        }
    });

    socket.on("BOARD_LEAVE", async (boardId: string) => {
        try {
            await socket.leave(boardId);
        } catch (err) {
            console.error("Error in BOARD_LEAVE:", err);
        }
    });
}