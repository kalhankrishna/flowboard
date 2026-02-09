import { useSocket } from '@/components/SocketProvider';
import { useCallback} from 'react';

type SuccessResponse = {
  success: true;
  resourceId: string;
};

type ErrorResponse = {
  success: false;
  error: string;
};

type DragResponse = SuccessResponse | ErrorResponse;

type DragData = {
    resourceId: string;
    x: number;
    y: number;
}

export const useDragBroadcasts = () => {
    const { socket } = useSocket();

    const dragStartBroadcast = useCallback(({boardId, resourceId}: {boardId: string, resourceId: string}) => {
        if (!socket) return;

        socket.emit('DRAG_START', {boardId, resourceId}, (response: DragResponse) => {
            if (!response.success) {
                console.error(response.error);
            }
        });
    }, [socket]);

    const dragOverBroadcast = useCallback(({boardId, resource}: {boardId: string, resource: DragData}) => {
        if (!socket) return;
        socket.emit('DRAG_OVER', {boardId, resource}, (response: DragResponse) => {
            if (!response.success) {
                console.error(response.error);
            }
        });
    }, [socket]);

    const dragEndBroadcast = useCallback(({boardId, resourceId}: {boardId: string,resourceId: string}) => {
        if (!socket) return;

        socket.emit('DRAG_END', {boardId, resourceId}, (response: DragResponse) => {
            if (!response.success) {
                console.error(response.error);
            }
        });
    }, [socket]);

    return { dragStartBroadcast, dragOverBroadcast, dragEndBroadcast };
};
