'use client';

import { usePresence } from "@/hooks";

export function PresenceIndicator({ boardId }: { boardId: string }) {
  const { onlineUsers } = usePresence(boardId);

  if (onlineUsers.length === 0) {
    return null;
  }

  const stringToHex = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const minHue = 170;
    const maxHue = 220;
    const hueRange = maxHue - minHue;
    
    const hue = minHue + (Math.abs(hash) % hueRange);
    
    return `hsl(${hue}, 65%, 55%)`;
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </span>
      <div className="flex -space-x-3">
        {onlineUsers.map((user) => (
          <div
            key={user.socketId}
            className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-sm font-medium hover:cursor-default"
            style={{ backgroundColor: stringToHex(user.userName) }}
            title={user.userName}
          >
            {user.userName.charAt(0).toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  );
}