import { create } from 'zustand';

export interface User {
  id: number | string;
  email: string;
  username: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Initialize from localStorage if available
  const storedToken = localStorage.getItem('illumskin_token');
  const storedUser = localStorage.getItem('illumskin_user');

  let initialUser = null;
  if (storedUser) {
    try {
      initialUser = JSON.parse(storedUser);
    } catch (e) {
      console.error('Failed to parse stored user', e);
    }
  }

  return {
    user: initialUser,
    token: storedToken,
    isAuthenticated: !!storedToken,
    login: (user, token) => {
      localStorage.setItem('illumskin_token', token);
      localStorage.setItem('illumskin_user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true });
    },
    logout: () => {
      localStorage.removeItem('illumskin_token');
      localStorage.removeItem('illumskin_user');
      set({ user: null, token: null, isAuthenticated: false });
    },
  };
});
