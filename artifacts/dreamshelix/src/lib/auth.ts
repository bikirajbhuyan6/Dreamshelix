import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  userId: number;
  role: 'student' | 'admin';
  exp: number;
}

interface AuthState {
  token: string | null;
  role: 'student' | 'admin' | null;
  setToken: (token: string | null) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => {
  const initialToken = localStorage.getItem('dreamshelix_token');
  let initialRole: 'student' | 'admin' | null = null;
  
  if (initialToken) {
    try {
      const decoded = jwtDecode<DecodedToken>(initialToken);
      if (decoded.exp * 1000 > Date.now()) {
        initialRole = decoded.role;
      } else {
        localStorage.removeItem('dreamshelix_token');
      }
    } catch (e) {
      localStorage.removeItem('dreamshelix_token');
    }
  }

  return {
    token: localStorage.getItem('dreamshelix_token'),
    role: initialRole,
    setToken: (token) => {
      if (token) {
        localStorage.setItem('dreamshelix_token', token);
        try {
          const decoded = jwtDecode<DecodedToken>(token);
          set({ token, role: decoded.role });
        } catch (e) {
          set({ token, role: null });
        }
      } else {
        localStorage.removeItem('dreamshelix_token');
        set({ token: null, role: null });
      }
    },
    logout: () => {
      localStorage.removeItem('dreamshelix_token');
      set({ token: null, role: null });
    },
    isAuthenticated: () => !!get().token,
  };
});

export const getAuthHeaders = () => {
  const token = useAuthStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};
