export interface Card {
  id: string;
  columnId: string;
  title: string;
  description: string | null;
  position: string;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  boardId: string;
  title: string;
  position: string;
  createdAt: string;
  updatedAt: string;
  cards: Card[];
}

export interface Board {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  columns: Column[];
  ownerId: string;
}

export interface CategorizedBoards {
  ownedBoards: Board[];
  sharedBoards: Board[];
}

export interface ReorderCard {
  cardId: string;
  prevCardId: string | null;
  nextCardId: string | null;
  columnId: string;
}

export interface ReorderColumn {
  columnId: string;
  prevColumnId: string | null;
  nextColumnId: string | null;
  boardId: string;
}