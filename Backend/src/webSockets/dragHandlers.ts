import { Socket, Server } from "socket.io";

type SuccessResponse = {
  success: true;
  resourceId: string;
};

type ErrorResponse = {
  success: false;
  error: string;
};

type DragResponse = SuccessResponse | ErrorResponse;

export type DragData = {
  resourceId: string;
  x: number;
  y: number;
};

export const activeDrags = new Map<string, {boardId: string, draggedObj: DragData}>();

export function registerDragHandlers(io: Server, socket: Socket) {
    const userName = socket.data.userName as string || 'Anonymous';

    socket.on("DRAG_START", async({boardId, resourceId}: {boardId: string, resourceId: string}, callback: (response: DragResponse) => void) => {
        try{
            activeDrags.set(socket.id, { boardId, draggedObj: { resourceId, x: 0, y: 0 } });
            socket.to(`board:${boardId}`).emit("DRAG_STARTED", {resourceId, userName});
            callback({ success: true, resourceId });
        }
        catch (err) {
            console.error(err);
            callback({ success: false, error: `Failed to start drag: ${err}` });
        }
    });

    socket.on("DRAG_OVER", async({boardId, resource}: {boardId: string, resource: DragData}, callback: (response: DragResponse) => void) => {
        try{
            const activeDrag = activeDrags.get(socket.id);
            if(activeDrag && activeDrag.boardId === boardId && activeDrag.draggedObj.resourceId === resource.resourceId){
                activeDrags.set(socket.id, { boardId, draggedObj: resource });
                socket.to(`board:${boardId}`).emit("DRAG_OVERED", {resource, userName});
                callback({ success: true, resourceId: resource.resourceId });
            } else {
                callback({ success: false, error: "No active drag found for this resource" });
            }
        }
        catch (err) {
            console.error(err);
            callback({ success: false, error: `Failed to move drag: ${err}` });
        }
    });

    socket.on("DRAG_END", async({boardId, resourceId}: {boardId: string, resourceId: string}, callback: (response: DragResponse) => void) => {
        try{
            const activeDrag = activeDrags.get(socket.id);
            if(activeDrag && activeDrag.boardId === boardId && activeDrag.draggedObj.resourceId === resourceId){
                activeDrags.delete(socket.id);
                socket.to(`board:${boardId}`).emit("DRAG_ENDED", resourceId);
                callback({ success: true, resourceId });
            } else {
                callback({ success: false, error: "No active drag found for this resource" });
            }
        }
        catch (err) {
            console.error(err);
            callback({ success: false, error: `Failed to end drag: ${err}` });
        }
    });

    socket.on("disconnect", () => {
        const activeDrag = activeDrags.get(socket.id);
        if(activeDrag){
            const resourceId = activeDrag.draggedObj.resourceId;
            socket.to(`board:${activeDrag.boardId}`).emit("DRAG_ENDED", resourceId);
            activeDrags.delete(socket.id);
        }
    });
};