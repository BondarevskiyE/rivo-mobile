import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {persist, createJSONStorage} from 'zustand/middleware';

import {KernelAccount} from './types';

interface ZeroDevState {
  kernelAccount: KernelAccount | null;
  setKernelAccount: (kernelAccount: KernelAccount | null) => void;
}

export const useZeroDevStore = create<ZeroDevState>()(
  persist(
    set => ({
      kernelAccount: null,
      setKernelAccount: kernelAccount => set({kernelAccount}),
    }),
    {
      name: 'zeroDev-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
