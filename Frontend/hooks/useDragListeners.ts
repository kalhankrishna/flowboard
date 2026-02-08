import { useEffect, useState } from 'react';
import { useSocket } from '@/components/SocketProvider';

type DraggedResource = {
    userName: string;
    x: number;
    y: number;
}

export const useDragListeners = (boardId: string | null) => {
    const { socket, isConnected } = useSocket();
    const [draggedResources, setDraggedResources] = useState(new Map<string, DraggedResource>());

    useEffect(() => {
        if (!socket || !isConnected || !boardId) return;

        const handleDragStart = ({ resourceId, userName }: { resourceId: string, userName: string }) => {
            setDraggedResources(prev => new Map(prev).set(resourceId, { userName, x: 0, y: 0 }));
        }

        const handleDragOver = ({ resource, userName }: {resource: {resourceId: string, x: number, y:number}, userName: string}) => {
            setDraggedResources(prev => {
                const updated = new Map(prev);
                updated.set(resource.resourceId, { userName, x: resource.x, y: resource.y });
                return updated;
            });
        }

        const handleDragEnd = (resourceId: string) => {
            setDraggedResources(prev => {
                const updated = new Map(prev);
                updated.delete(resourceId);
                return updated;
            });
        }

        const handleInitDrags = (drags: {resourceId: string, userName: string, x: number, y: number}[]) => {
            const dragMap = new Map<string, DraggedResource>();
            drags.forEach(drag => dragMap.set(drag.resourceId, { userName: drag.userName, x: drag.x, y: drag.y }));
            setDraggedResources(dragMap);
        }

        socket.on('DRAG_STARTED', handleDragStart);
        socket.on('DRAG_OVERED', handleDragOver);
        socket.on('DRAG_ENDED', handleDragEnd);
        socket.on('BOARD_DRAGS_INIT', handleInitDrags);

        return () => {
            setDraggedResources(new Map<string, DraggedResource>());
            socket.off('DRAG_STARTED', handleDragStart);
            socket.off('DRAG_OVERED', handleDragOver);
            socket.off('DRAG_ENDED', handleDragEnd);
            socket.off('BOARD_DRAGS_INIT', handleInitDrags);
        }
    }, [socket, isConnected, boardId]);

    return draggedResources;
};