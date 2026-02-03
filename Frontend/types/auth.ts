export interface User {
  userId: string;
  email: string;
  name: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  accessToken: string | null;

  setUser: (user: User | null) => void;
  clearUser: () => void;

  setToken: (accessToken: string | null) => void;
  clearToken: () => void;
}