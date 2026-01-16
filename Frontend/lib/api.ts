import { Board } from '@/types/board';
import { Column } from '@/types/board';
import { Card } from '@/types/board';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';


//Board API calls
export async function getBoard(boardId: string): Promise<Board> {
  const response = await fetch(`${API_BASE_URL}/api/boards/${boardId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch board: ${response.statusText}`);
  }
  
  return response.json();
}

//Column API calls
export async function addColumn(boardId: string, title: string, position: number): Promise<Column> {
  const response = await fetch(`${API_BASE_URL}/api/columns`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ boardId, title, position })
  });

  if (!response.ok) {
    throw new Error(`Failed to create column: ${response.statusText}`);
  }

  return response.json();
}

export async function updateColumn(id: string, title: string, position: number): Promise<Column> {
  const response = await fetch(`${API_BASE_URL}/api/columns/${id}`, {
    method: 'PATCH',
    headers: {'Content-Type': 'application/json' },
    body: JSON.stringify({ title, position })
  });

  if (!response.ok) {
    throw new Error(`Failed to update column: ${response.statusText}`);
  }

  return response.json();
}

export async function deleteColumn(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/columns/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete column: ${response.statusText}`);
  }

  return;
}

//Card API calls
export async function addCard(columnId: string, title: string, description: string | null, position: number): Promise<Card> {
  const response = await fetch(`${API_BASE_URL}/api/cards`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ columnId, title, description, position })
  });

  if (!response.ok) {
    throw new Error(`Failed to create card: ${response.statusText}`);
  }

  return response.json();
}

export async function updateCard(id: string, title: string, description: string | null, position: number): Promise<Card> {
  const response = await fetch(`${API_BASE_URL}/api/cards/${id}`, {
    method: 'PATCH',
    headers: {'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, position })
  });

  if (!response.ok) {
    throw new Error(`Failed to update card: ${response.statusText}`);
  }

  return response.json();
}

export async function deleteCard(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/cards/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete card: ${response.statusText}`);
  }

  return;
}