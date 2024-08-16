import {chain} from '@/shared/constants';
import {useZeroDevStore} from '@/store/useZeroDevStore';

import {
  Abi,
  Client,
  createPublicClient,
  getContract as getContractInstance,
  http,
} from 'viem';

interface Params {
  contractAddress: `0x${string}`;
  abi: Abi | readonly unknown[];
}

export const getContract = ({contractAddress, abi}: Params) => {
  const kernelClient = useZeroDevStore.getState().kernelClient;

  const publicClient = createPublicClient({
    chain: chain,
    transport: http(),
  });

  return getContractInstance({
    address: contractAddress,
    abi: abi as Abi,
    client: {
      public: publicClient,
      // viem doesn't like to get wallet field as zerodev kernelClient but it can to (https://docs.zerodev.app/sdk/core-api/send-transactions)
      wallet: kernelClient as unknown as Client,
    },
  });
};
