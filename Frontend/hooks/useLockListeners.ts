import { useEffect, useState } from 'react';
import { useSocket } from '@/components/SocketProvider';

type LockedResource = {
    resourceId: string;
    userName: string;
}

export const useLockListeners = (boardId: string | null) => {
    const { socket, isConnected } = useSocket();
    const [lockedResources, setLockedResources] = useState(new Map<string, string>());

    useEffect(() => {
        if (!socket || !isConnected || !boardId) return;

        const handleResourceLock = ( { resourceId, userName }: LockedResource) => {
          setLockedResources(prev => new Map(prev).set(resourceId, userName));
        }

        const handleResourceUnlock = ( { resourceId }: { resourceId: string }) => {
            setLockedResources(prev => {
                const updated = new Map(prev);
                updated.delete(resourceId);
                return updated;
            });
        }

        const handleInitLocks = (locks: LockedResource[]) => {
            const lockMap = new Map<string, string>();
            locks.forEach(lock => lockMap.set(lock.resourceId, lock.userName));
            setLockedResources(lockMap);
        }

        socket.on('RESOURCE_LOCKED', handleResourceLock);
        socket.on('RESOURCE_UNLOCKED', handleResourceUnlock);
        socket.on('BOARD_LOCKS_INIT', handleInitLocks);

        return () => {
            setLockedResources(new Map<string, string>());
            socket.off('RESOURCE_LOCKED', handleResourceLock);
            socket.off('RESOURCE_UNLOCKED', handleResourceUnlock);
            socket.off('BOARD_LOCKS_INIT', handleInitLocks);
        }
    }, [socket, isConnected, boardId]);

    return lockedResources;
};