"use client"

import { useDroppable } from "@dnd-kit/core";

export default function DroppableColumn({column, children}: {column: {id: string; title: string; items: {id: string; title: string; description: string}[]}, children: React.ReactNode}) {
    const { setNodeRef } = useDroppable({
      id: column.id
    });

    return (
      <div ref={setNodeRef} className="bg-gray-100 p-4 rounded-lg w-full min-h-140">
        <h2 className="font-semibold mb-4 text-black">{column.title}</h2>
        {children}
      </div>
    );
}