import {create} from 'zustand';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {persist, createJSONStorage} from 'zustand/middleware';
import {User} from './types';

interface UserState {
  isLoggedIn: boolean;
  userInfo: User | null;
  walletAddress: string;
  setIsLoggedIn: (bool: boolean) => void;
  setUserInfo: (user: User | null) => void;
  setWalletAddress: (address: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    set => ({
      isLoggedIn: false,
      userInfo: null,
      walletAddress: '',
      setIsLoggedIn: (bool: boolean) => set({isLoggedIn: bool}),
      setUserInfo: (user: User | null) => {
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
