import {create} from 'zustand';
import {persist} from 'zustand/middleware';

interface LoginState {
  isLoggedIn: boolean;
  setIsLoggedIn: (bool: boolean) => void;
}

export const useLoginState = create<LoginState>()(
  persist(
    set => ({
      isLoggedIn: false,
      setIsLoggedIn: (bool: boolean) => set({isLoggedIn: bool}),
    }),
    {
      name: 'login-storage',
    },
  ),
);
