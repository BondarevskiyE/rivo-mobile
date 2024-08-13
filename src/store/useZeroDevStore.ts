import {create} from 'zustand';

import {Alert} from 'react-native';
// import {encodeFunctionData} from 'viem';
import {arbitrum} from 'viem/chains';
import {bundlerActions} from 'permissionless';

import {web3AuthReconnect} from '@/services/web3auth';
import {chain, entryPoint, initZeroDevClient} from '@/services/zerodev';
import {createKernelDefiClient, baseTokenAddresses} from '@zerodev/defi';
import {USDC_DECIMALS, ZERODEV_API_KEY} from '@/shared/constants';
import {KernelClient} from './types';
import {getTokenValueBigInt} from '@/shared/lib/bigInt';

import {
  Client,
  createPublicClient,
  encodeFunctionData,
  getContract,
  http,
} from 'viem';
import VaultABI from '@/abis/Vault.json';
import ERC20ABI from '@/abis/ERC20.json';
import {useUserStore} from './useUserStore';

interface ZeroDevState {
  kernelClient: KernelClient | null;
  setKernelClient: (kernelAccount: KernelClient | null) => void;
  invest: (tokenContractAddress: `0x${string}`, amount: string) => void;
  reconnectZeroDev: () => void;
}

export const useZeroDevStore = create<ZeroDevState>()((set, get) => ({
  kernelClient: null,
  setKernelClient: (kernelClient: KernelClient | null) => set({kernelClient}),

  invest: async (tokenContractAddress: `0x${string}`, amount: string) => {
    try {
      const kernelClient = get().kernelClient;
      const userAddress = useUserStore.getState().walletAddress;

      if (!kernelClient) {
        throw new Error('no kernelClient');
      }

      const defiClient = createKernelDefiClient(kernelClient, ZERODEV_API_KEY);

      const publicClient = createPublicClient({
        chain: chain,
        transport: http(),
      });

      const tokenContract = getContract({
        address: tokenContractAddress as `0x${string}`,
        abi: VaultABI,
        client: {
          public: publicClient,
          // viem doesn't like to get wallet field as zerodev kernelClient but it can to (https://docs.zerodev.app/sdk/core-api/send-transactions)
          wallet: kernelClient as unknown as Client,
        },
      });

      const investTokenAddress =
        (await tokenContract.read.token()) as `0x${string}`;

      const userOpHash = await defiClient.sendSwapUserOp({
        fromToken: baseTokenAddresses[arbitrum.id].USDC,
        fromAmount: getTokenValueBigInt(amount, USDC_DECIMALS),
        toToken: investTokenAddress,

        gasToken: 'sponsored',
      });

      // @ts-ignore
      const bundlerClient = kernelClient.extend(bundlerActions(entryPoint));
      await bundlerClient.waitForUserOperationReceipt({
        hash: userOpHash,
      });

      const investTokenContract = getContract({
        address: investTokenAddress as `0x${string}`,
        abi: ERC20ABI,
        client: {
          public: publicClient,
          // viem doesn't like to get wallet field as zerodev kernelClient but it can to (https://docs.zerodev.app/sdk/core-api/send-transactions)
          wallet: kernelClient as unknown as Client,
        },
      });

      const investTokenUserBalance = (await investTokenContract.read.balanceOf([
        userAddress,
      ])) as bigint;

      const investUserOperationData = {
        callData: await kernelClient.account.encodeCallData([
          {
            to: investTokenAddress,
            value: BigInt(0),
            data: encodeFunctionData({
              abi: ERC20ABI,
              functionName: 'approve',
              args: [tokenContractAddress, investTokenUserBalance],
            }),
          },
          {
            to: tokenContractAddress,
            value: BigInt(0),
            data: encodeFunctionData({
              abi: VaultABI,
              functionName: 'deposit',
              args: [investTokenUserBalance],
            }),
          },
        ]),
      };

      const investUserOp = await kernelClient.prepareUserOperationRequest({
        userOperation: investUserOperationData,
        account: kernelClient.account,
      });

      const userOpInvestTxHash = await kernelClient.sendUserOperation({
        userOperation: {
          ...investUserOperationData,
          callGasLimit: (investUserOp.callGasLimit * BigInt(104)) / BigInt(100),
        },
        account: kernelClient.account,
      });

      // const investTxReceipt =
      await bundlerClient.waitForUserOperationReceipt({
        hash: userOpInvestTxHash,
      });

      Alert.alert('success');
    } catch (error) {
      console.log(error);
      Alert.alert(`something went wrong: ${error}`);
    }
  },
  reconnectZeroDev: async () => {
    const smartAccountSigner = await web3AuthReconnect();

    if (smartAccountSigner) {
      const kernelClient = await initZeroDevClient(smartAccountSigner);

      set({kernelClient: kernelClient as KernelClient});
    }
  },
}));
