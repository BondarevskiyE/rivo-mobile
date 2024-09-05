import {create} from 'zustand';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {persist, createJSONStorage} from 'zustand/middleware';
import {User} from './types';

interface UserState {
  isLoggedIn: boolean;
  userInfo: User | null;
  walletAddress: string;
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;
  setIsLoggedIn: (bool: boolean) => void;
  setUserInfo: (user: User | null) => void;
  setWalletAddress: (address: string) => void;

  resetUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    set => ({
      isLoggedIn: false,
      userInfo: null,
      walletAddress: '',
      onboardingStep: 1,
      setOnboardingStep: (step: number) => set({onboardingStep: step}),
      setIsLoggedIn: (bool: boolean) => set({isLoggedIn: bool}),
      setUserInfo: (user: User | null) => {
        set({userInfo: user});
      },
      setWalletAddress: (address: string) => {
        set({walletAddress: address});
      },
      resetUser: () =>
        set({
          userInfo: null,
          walletAddress: '',
          onboardingStep: 1,
        }),
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
