import { Board, Column, Card, ReorderColumns, ReorderCards } from '@/types/board';
import { User, RegisterInput, LoginInput } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Global fetch wrapper with 401 handling
async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
  });

  // Handle 401
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      const { useAuthStore } = await import('@/store/authStore');
      useAuthStore.getState().clearUser();
      
      // Redirect to login
      window.location.href = '/login';
    }
  }

  return response;
}

//Auth API calls
export async function register(data: RegisterInput): Promise<User> {
  const response = await apiFetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }

  return response.json();
}

export async function login(data: LoginInput): Promise<User> {
  const response = await apiFetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  return response.json();
}

export async function logout(): Promise<void> {
  const response = await apiFetch(`${API_BASE_URL}/api/auth/logout`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Logout failed');
  }

  return;
}

//Board API calls
export async function getBoard(boardId: string): Promise<Board> {
  const response = await apiFetch(`${API_BASE_URL}/api/boards/${boardId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch board: ${response.statusText}`);
  }
  
  return response.json();
}

export async function getBoards(): Promise<Board[]> {
  const response = await apiFetch(`${API_BASE_URL}/api/boards`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch boards: ${response.statusText}`);
  }

  return response.json();
}

export async function addBoard(name: string): Promise<Board> {
  const response = await apiFetch(`${API_BASE_URL}/api/boards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });

  if (!response.ok) {
    throw new Error(`Failed to create board: ${response.statusText}`);
  }

  return response.json();
}

export async function updateBoard(id: string, name: string): Promise<Board> {
  const response = await apiFetch(`${API_BASE_URL}/api/boards/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });

  if (!response.ok) {
    throw new Error(`Failed to update board: ${response.statusText}`);
  }

  return response.json();
}

export async function deleteBoard(id: string): Promise<void> {
  const response = await apiFetch(`${API_BASE_URL}/api/boards/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete board: ${response.statusText}`);
  }

  return;
}

//Column API calls
export async function addColumn(boardId: string, title: string, position: number): Promise<Column> {
  const response = await apiFetch(`${API_BASE_URL}/api/columns`, {
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
  const response = await apiFetch(`${API_BASE_URL}/api/columns/${id}`, {
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
  const response = await apiFetch(`${API_BASE_URL}/api/columns/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete column: ${response.statusText}`);
  }

  return;
}

export async function reorderColumns(columns: ReorderColumns[]): Promise<void> {
  const response = await apiFetch(`${API_BASE_URL}/api/columns/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ columns })
  });

  if (!response.ok) {
    throw new Error(`Failed to reorder columns: ${response.statusText}`);
  }

  return response.json();
}

//Card API calls
export async function addCard(columnId: string, title: string, description: string | null, position: number): Promise<Card> {
  const response = await apiFetch(`${API_BASE_URL}/api/cards`, {
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
  const response = await apiFetch(`${API_BASE_URL}/api/cards/${id}`, {
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
  const response = await apiFetch(`${API_BASE_URL}/api/cards/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete card: ${response.statusText}`);
  }

  return;
}

export async function reorderCards(columns: ReorderCards[]): Promise<void> {
  const response = await apiFetch(`${API_BASE_URL}/api/cards/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ columns })
  });

  if (!response.ok) {
    throw new Error(`Failed to reorder cards: ${response.statusText}`);
  }

  return response.json();
}