import {create} from 'zustand';

import {KernelAccount} from './types';
import {web3AuthReconnect} from '@/services/web3auth';
import {initZeroDevClient} from '@/services/zerodev';

interface ZeroDevState {
  kernelAccount: KernelAccount | null;
  setKernelAccount: (kernelAccount: KernelAccount | null) => void;
  reconnectZeroDev: () => void;
}

export const useZeroDevStore = create<ZeroDevState>()(set => ({
  kernelAccount: null,
  setKernelAccount: kernelAccount => set({kernelAccount}),
  reconnectZeroDev: async () => {
    const smartAccountSigner = await web3AuthReconnect();

    if (smartAccountSigner) {
      const kernelAccount = await initZeroDevClient(smartAccountSigner);

      set({kernelAccount: kernelAccount as KernelAccount});
    }
  },
}));
