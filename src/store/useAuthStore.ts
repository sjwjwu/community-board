import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  userId: string;
  name: string;
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => {
        set({ user: null });
        localStorage.removeItem('accessToken');
      },
    }),
    { name: 'auth-storage' } // 브라우저를 새로고침해도 로그인 정보 유지
  )
);