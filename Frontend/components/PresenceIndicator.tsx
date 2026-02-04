'use client';

import { usePresence } from "@/hooks";

export function PresenceIndicator({ boardId }: { boardId: string }) {
  const { onlineUsers } = usePresence(boardId);

  if (onlineUsers.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {onlineUsers.map((user) => (
          <div
            key={user.socketId}
            className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-black text-sm font-medium"
            title={user.userName}
          >
            {user.userName.charAt(0).toUpperCase()}
          </div>
        ))}
      </div>
      <span className="text-sm text-gray-600">
        {onlineUsers.length} online
      </span>
    </div>
  );
}