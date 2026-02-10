import { Board, Column, Card, ReorderColumn, ReorderCard, CategorizedBoards } from '@/types/board';
import { User, RegisterInput, LoginInput } from '@/types/auth';
import { BoardAccess, ShareBoardInput, UpdateRoleInput } from '@/types/share';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

// Refresh access token
async function refreshAccessToken(): Promise<string> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Refresh failed');

      const { accessToken } = await response.json();
      if(typeof window !== 'undefined'){
        localStorage.setItem('accessToken', accessToken);
        window.dispatchEvent(new CustomEvent('auth:token-refreshed', { 
          detail: { accessToken } 
        }));
      }
      
      return accessToken;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// Global fetch wrapper with auth + refresh
async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  });

  // Handle 401
  if (response.status === 401) {
    const errorData = await response.json();
    if(errorData.code === 'TOKEN_EXPIRED' || errorData.code === 'NO_TOKEN') {
      try {
        const newToken = await refreshAccessToken();

        response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${newToken}`,
          },
        });

        return response;
      } catch {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:session-expired'));
        }
        throw new Error('Session expired');
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
  }

  return response;
}

//Auth API calls
export async function register(data: RegisterInput): Promise<{ accessToken: string; user: User }> {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }

  return response.json();
}

export async function login(data: LoginInput): Promise<{ accessToken: string; user: User }> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  return response.json();
}

export async function logout(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Logout failed');
  }
  
  return;
}

//Board API calls
export async function getBoard(boardId: string): Promise<Board> {
  try{
    const response = await apiFetch(`${API_BASE_URL}/api/boards/${boardId}`);
  
    if (!response.ok) {
      throw new Error("Failed to fetch board");
    }
    
    return response.json();
  }
  catch(error){
    throw error;
  }
}

export async function getBoards(): Promise<CategorizedBoards> {
  const response = await apiFetch(`${API_BASE_URL}/api/boards`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch boards");
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
    throw new Error("Failed to create board");
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
    throw new Error("Failed to update board");
  }

  return response.json();
}

export async function deleteBoard(id: string): Promise<void> {
  const response = await apiFetch(`${API_BASE_URL}/api/boards/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error("Failed to delete board");
  }

  return;
}

//Column API calls
export async function addColumn(boardId: string, title: string): Promise<Column> {
  const response = await apiFetch(`${API_BASE_URL}/api/columns`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ boardId, title })
  });

  if (!response.ok) {
    throw new Error("Failed to create column");
  }

  return response.json();
}

export async function updateColumn(id: string, title: string): Promise<Column> {
  const response = await apiFetch(`${API_BASE_URL}/api/columns/${id}`, {
    method: 'PATCH',
    headers: {'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  });

  if (!response.ok) {
    throw new Error("Failed to update column");
  }

  return response.json();
}

export async function deleteColumn(id: string): Promise<void> {
  const response = await apiFetch(`${API_BASE_URL}/api/columns/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error("Failed to delete column");
  }

  return;
}

export async function reorderColumn(data: ReorderColumn): Promise<void> {
  const response = await apiFetch(`${API_BASE_URL}/api/columns/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error("Failed to reorder columns");
  }

  return response.json();
}

//Card API calls
export async function addCard(columnId: string, title: string, description: string | null): Promise<Card> {
  const response = await apiFetch(`${API_BASE_URL}/api/cards`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ columnId, title, description })
  });

  if (!response.ok) {
    throw new Error("Failed to create card");
  }

  return response.json();
}

export async function updateCard(id: string, title: string, description: string | null): Promise<Card> {
  const response = await apiFetch(`${API_BASE_URL}/api/cards/${id}`, {
    method: 'PATCH',
    headers: {'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description })
  });

  if (!response.ok) {
    throw new Error("Failed to update card");
  }

  return response.json();
}

export async function deleteCard(id: string): Promise<void> {
  const response = await apiFetch(`${API_BASE_URL}/api/cards/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error("Failed to delete card");
  }

  return;
}

export async function reorderCard(data: ReorderCard): Promise<void> {
  const response = await apiFetch(`${API_BASE_URL}/api/cards/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if(!response.ok) {
    throw new Error("Failed to reorder cards");
  }
}

//Board Sharing API Calls
export async function getBoardCollaborators(boardId: string) : Promise<BoardAccess[]> {
  const response = await apiFetch(`${API_BASE_URL}/api/boards/${boardId}/access`);

  if (!response.ok) {
    throw new Error("Failed to fetch collaborators");
  }

  return response.json();
}

export async function shareBoard(boardId: string, data: ShareBoardInput): Promise<BoardAccess> {
  const response = await apiFetch(`${API_BASE_URL}/api/boards/${boardId}/share`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error("Failed to share board");
  }

  return response.json();
}

export async function updateCollaboratorRole(boardId: string, userId: string, data: UpdateRoleInput): Promise<BoardAccess> {
  const response = await apiFetch(`${API_BASE_URL}/api/boards/${boardId}/access/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error("Failed to update collaborator role");
  }

  return response.json();
}

export async function removeCollaborator(boardId: string, userId: string): Promise<void> {
  const response = await apiFetch(`${API_BASE_URL}/api/boards/${boardId}/access/${userId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error("Failed to remove collaborator");
  }

  return;
}