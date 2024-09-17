import {create} from 'zustand';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {persist, createJSONStorage} from 'zustand/middleware';
import {User} from './types';

interface UserState {
  userInfo: User | null;
  walletAddress: string;
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;
  setUserInfo: (user: User | null) => void;
  setWalletAddress: (address: string) => void;

  resetUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    set => ({
      userInfo: null,
      walletAddress: '',
      onboardingStep: 1,
      setOnboardingStep: (step: number) => set({onboardingStep: step}),
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
