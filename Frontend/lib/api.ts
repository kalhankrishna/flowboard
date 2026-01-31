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

      if (!response.ok) {
        throw new Error('Refresh failed');
      }

      const { accessToken } = await response.json();
      localStorage.setItem('accessToken', accessToken);
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
  const token = localStorage.getItem('accessToken');

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    credentials: url.includes('/auth/refresh') || url.includes('/auth/logout') ? 'include' : undefined,
  });

  // Handle 401
  if (response.status === 401) {
    const errorData = await response.json();

    // Try refresh for missing OR expired token
    if (errorData.code === 'TOKEN_EXPIRED' || errorData.code === 'NO_TOKEN') {
      try {
        const newToken = await refreshAccessToken();

        // Retry original request with new token
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${newToken}`,
          },
        });
      } catch (refreshError) {
        // Refresh failed → logout
        localStorage.removeItem('accessToken');
        
        if (typeof window !== 'undefined') {
          const { useAuthStore } = await import('@/store/authStore');
          useAuthStore.getState().clearUser();
          window.location.href = '/login';
        }
        
        throw new Error('Session expired');
      }
    }

    // Other 401s (INVALID_CREDENTIALS, REFRESH_TOKEN_EXPIRED, etc.) → logout
    localStorage.removeItem('accessToken');
    
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        const { useAuthStore } = await import('@/store/authStore');
        useAuthStore.getState().clearUser();
        window.location.href = '/login';
      }
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

  // Clear access token
  localStorage.removeItem('accessToken');
  
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

export async function getBoards(): Promise<CategorizedBoards> {
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
export async function addColumn(boardId: string, title: string, position: string): Promise<Column> {
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

export async function updateColumn(id: string, title: string, position: string): Promise<Column> {
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

export async function reorderColumn(data: ReorderColumn): Promise<void> {
  const response = await apiFetch(`${API_BASE_URL}/api/columns/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error(`Failed to reorder columns: ${response.statusText}`);
  }

  return response.json();
}

//Card API calls
export async function addCard(columnId: string, title: string, description: string | null, position: string): Promise<Card> {
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

export async function updateCard(id: string, title: string, description: string | null, position: string): Promise<Card> {
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

export async function reorderCard(data: ReorderCard): Promise<void> {
  const response = await apiFetch(`${API_BASE_URL}/api/cards/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if(!response.ok) {
    throw new Error(`Failed to reorder cards: ${response.statusText}`);
  }
}

//Board Sharing API Calls
export async function getBoardCollaborators(boardId: string) : Promise<BoardAccess[]> {
  const response = await apiFetch(`${API_BASE_URL}/api/boards/${boardId}/access`);

  if (!response.ok) {
    throw new Error(`Failed to fetch collaborators: ${response.statusText}`);
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
    throw new Error(`Failed to share board: ${response.statusText}`);
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
    throw new Error(`Failed to update collaborator role: ${response.statusText}`);
  }

  return response.json();
}

export async function removeCollaborator(boardId: string, userId: string): Promise<void> {
  const response = await apiFetch(`${API_BASE_URL}/api/boards/${boardId}/access/${userId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to remove collaborator: ${response.statusText}`);
  }

  return;
}