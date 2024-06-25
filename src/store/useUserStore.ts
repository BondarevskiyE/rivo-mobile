import {create} from 'zustand';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {persist, createJSONStorage} from 'zustand/middleware';

interface UserState {
  isLoggedIn: boolean;
  userInfo: Record<string, string> | null;
  walletAddress: string;
  setIsLoggedIn: (bool: boolean) => void;
  setUserInfo: (user: Record<string, string>) => void;
  setWalletAddress: (address: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    set => ({
      isLoggedIn: false,
      userInfo: {},
      walletAddress: '',
      setIsLoggedIn: (bool: boolean) => set({isLoggedIn: bool}),
      setUserInfo: (user: Record<string, string>) => {
        set({userInfo: user});
      },
      setWalletAddress: (address: string) => {
        set({walletAddress: address});
      },
    }),
    {
      name: 'user-state',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
