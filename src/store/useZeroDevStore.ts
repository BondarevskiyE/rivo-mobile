import {create} from 'zustand';

import {KernelClient} from './types';
import {web3AuthReconnect} from '@/services/web3auth';
import {initZeroDevClient} from '@/services/zerodev';
import {Alert} from 'react-native';
import {encodeFunctionData} from 'viem';

interface ZeroDevState {
  kernelClient: KernelClient | null;
  defiClient: KernelClient | null;
  setDefiClient: (kernelAccount: KernelClient | null) => void;
  setKernelClient: (kernelAccount: KernelClient | null) => void;
  sendUserOperation: () => string;
  reconnectZeroDev: () => void;
}

export const useZeroDevStore = create<ZeroDevState>()((set, get) => ({
  kernelClient: null,
  defiClient: null,
  setDefiClient: (defiClient: KernelClient | null) => set({defiClient}),
  setKernelClient: (kernelClient: KernelClient | null) => set({kernelClient}),
  sendUserOperation: async () => {
    const kernelClient = get().kernelClient;
    if (!kernelClient) {
      Alert.alert('something went wrong');
      return;
    }

    // const userOpHash = await kernelClient?.sendUserOperation({
    //   userOperation: {
    //     callData: await kernelClient?.account.encodeCallData({
    //       to: '0x23',
    //       value: BigInt(0),
    //       data: encodeFunctionData({
    //         abi: JSON.stringify('{}'),
    //         functionName: 'functionName',
    //         args: ['args1', 'args2'],
    //       }),
    //     }),
    //   },
    // });

    return '0x';
  },
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
