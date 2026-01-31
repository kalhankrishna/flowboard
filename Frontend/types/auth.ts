export interface User {
  id: string;
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

  setUser: (user: User | null) => void;
  clearUser: () => void;
  login: (user: User) => void;
  logout: () => void;
}