export const queryKeys = {
  // Board queries
  board: (boardId: string) => ['board', boardId] as const,
  boards: () => ['boards'] as const,
  
  // Column queries
  columns: (boardId: string) => ['columns', boardId] as const,
  
  // Card queries
  cards: (columnId: string) => ['cards', columnId] as const,
} as const;