import { Socket, Server } from "socket.io";
import { getRoleByBoardId, hasSufficientRole } from "../lib/permission.helper.js";

type SuccessResponse = {
  success: true;
  resourceId: string;
};

type ErrorResponse = {
  success: false;
  error: string;
};

type ResourceLockResponse = SuccessResponse | ErrorResponse;

export const resourceLocks = new Map<string, {boardId: string, resourceId: string}>();

export function registerLockHandlers(io: Server, socket: Socket) {
    const userId = socket.data.userId as string;
    const userName = socket.data.userName as string || 'Anonymous';

    socket.on("RESOURCE_LOCK", async ({boardId, resourceId}: {boardId: string, resourceId: string}, callback: (response: ResourceLockResponse) => void) => {
        try {
            const role = await getRoleByBoardId(boardId, userId);
            if (!role || !hasSufficientRole(role, "EDITOR")) {
                callback({ success: false, error: "Not authorized to lock this resource" });
                return;
            }

            resourceLocks.set(socket.id, {boardId: boardId, resourceId: resourceId});

            socket.to(`board:${boardId}`).emit("RESOURCE_LOCKED", { resourceId, userName });

            callback({ success: true, resourceId });

        } catch (err) {
            console.error(err);
            callback({ success: false, error: `Failed to lock resource: ${err}` });
        }
    });

    socket.on("RESOURCE_UNLOCK", async ({boardId, resourceId}: {boardId: string, resourceId: string}, callback: (response: ResourceLockResponse) => void) => {
        try{
            const lock = resourceLocks.get(socket.id);
            if(lock){
                resourceLocks.delete(socket.id);
                socket.to(`board:${boardId}`).emit("RESOURCE_UNLOCKED", { resourceId });
            }
            callback({ success: true, resourceId });
        } catch (err) {
            console.error(err);
            callback({ success: false, error: `Failed to unlock resource: ${err}` });
        }
    });

    socket.on("disconnect", () => {
        const lock = resourceLocks.get(socket.id);
        if(lock){
            socket.to(`board:${lock.boardId}`).emit("RESOURCE_UNLOCKED", { resourceId: lock.resourceId });
            resourceLocks.delete(socket.id);
        }
    });
}