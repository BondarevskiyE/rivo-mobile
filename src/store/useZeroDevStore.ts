import {create} from 'zustand';

import {KernelClient} from './types';
import {web3AuthReconnect} from '@/services/web3auth';
import {initZeroDevClient} from '@/services/zerodev';

interface ZeroDevState {
  kernelClient: KernelClient | null;
  defiClient: KernelClient | null;
  setDefiClient: (kernelAccount: KernelClient | null) => void;
  setKernelClient: (kernelAccount: KernelClient | null) => void;
  reconnectZeroDev: () => void;
}

export const useZeroDevStore = create<ZeroDevState>()(set => ({
  kernelClient: null,
  defiClient: null,
  setDefiClient: defiClient => set({defiClient}),
  setKernelClient: kernelClient => set({kernelClient}),
  reconnectZeroDev: async () => {
    const smartAccountSigner = await web3AuthReconnect();

    if (smartAccountSigner) {
      const {kernelClient, defiClient} = await initZeroDevClient(
        smartAccountSigner,
      );

      set({kernelClient: kernelClient as KernelClient});
      set({defiClient: defiClient as KernelClient}); // TODO fix to right type ?
    }
  },
}));
