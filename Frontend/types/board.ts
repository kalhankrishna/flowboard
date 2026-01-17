export interface Card {
  id: string;
  columnId: string;
  title: string;
  description: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  boardId: string;
  title: string;
  position: number;
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
}

export interface ReorderCards {
  columnId: string;
  cards: Array<{
    id: string;
    position: number;
  }>;
}

export interface ReorderColumns {
  id: string;
  position: number;
}