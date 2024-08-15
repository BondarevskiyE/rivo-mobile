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
import VaultTokenABI from '@/abis/VaultToken.json';
import VaultABI from '@/abis/Vault.json';
import ERC20ABI from '@/abis/ERC20.json';
import {useUserStore} from './useUserStore';
import {fetchPendleStruct} from '@/shared/api/vault';
import {Vault} from '@/shared/types';

interface ZeroDevState {
  kernelClient: KernelClient | null;
  setKernelClient: (kernelAccount: KernelClient | null) => void;
  invest: (tokenContractAddress: `0x${string}`, amount: string) => void;
  withdraw: (vault: Vault, amount: string) => void;
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
        abi: VaultTokenABI,
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
              abi: VaultTokenABI,
              functionName: 'deposit',
              args: [investTokenUserBalance],
            }),
          },
        ]),
      };

      const investUserOp = await kernelClient.prepareUserOperationRequest({
        userOperation: investUserOperationData,
        // @ts-ignore FIX why type is incompitible
        account: kernelClient.account,
      });

      const userOpInvestTxHash = await kernelClient.sendUserOperation({
        userOperation: {
          ...investUserOperationData,
          callGasLimit: (investUserOp.callGasLimit * BigInt(104)) / BigInt(100),
        },
        // @ts-ignore FIX why type is incompitible
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
  withdraw: async (vault: Vault, amount: string) => {
    try {
      const kernelClient = get().kernelClient;
      const userAddress = useUserStore.getState().walletAddress;

      const pendleStruct = await fetchPendleStruct(vault.strategies);

      if (!pendleStruct || !kernelClient) {
        throw new Error('something went wrong');
      }

      const publicClient = createPublicClient({
        chain: chain,
        transport: http(),
      });

      const vaultContract = getContract({
        address: vault.address as `0x${string}`,
        abi: VaultABI,
        client: {
          public: publicClient,
          // viem doesn't like to get wallet field as zerodev kernelClient but it can to (https://docs.zerodev.app/sdk/core-api/send-transactions)
          wallet: kernelClient as unknown as Client,
        },
      });

      const vaultDecimals = (await vaultContract.read.decimals()) as number;

      const preparedValue = +amount * 10 ** vaultDecimals;

      const args = {
        maxShares: BigInt(Math.round(+preparedValue)),
        recipient: userAddress,
        maxLoss: BigInt(5000),
        offChainData: pendleStruct.offChainData,
        signatures: pendleStruct.signatures,
      };

      const withdrapUserOperationData = {
        callData: await kernelClient.account.encodeCallData([
          {
            to: vault.token_address as `0x${string}`,
            value: BigInt(0),
            data: encodeFunctionData({
              abi: VaultTokenABI,
              functionName: 'withdraw',
              args: [
                args.maxShares,
                args.recipient,
                args.maxLoss,
                args.offChainData,
                args.signatures,
              ],
            }),
          },
        ]),
      };

      const withdrawUserOp = await kernelClient.prepareUserOperationRequest({
        userOperation: withdrapUserOperationData,
        // @ts-ignore FIX why type is incompitible
        account: kernelClient.account,
      });

      const userOpWithdrawTxHash = await kernelClient.sendUserOperation({
        userOperation: {
          ...withdrapUserOperationData,
          callGasLimit:
            (withdrawUserOp.callGasLimit * BigInt(104)) / BigInt(100),
        },
        // @ts-ignore FIX why type is incompitible
        account: kernelClient.account,
      });

      // @ts-ignore
      const bundlerClient = kernelClient.extend(bundlerActions(entryPoint));
      const withdrawTxReceipt = await bundlerClient.waitForUserOperationReceipt(
        {
          hash: userOpWithdrawTxHash,
        },
      );

      console.log('withdrawTxReceipt: ', withdrawTxReceipt);

      const vaultTokenContract = getContract({
        address: vault.token_address as `0x${string}`,
        abi: VaultTokenABI,
        client: {
          public: publicClient,
          // viem doesn't like to get wallet field as zerodev kernelClient but it can to (https://docs.zerodev.app/sdk/core-api/send-transactions)
          wallet: kernelClient as unknown as Client,
        },
      });

      const withdrawTokenAddress =
        (await vaultTokenContract.read.token()) as `0x${string}`;

      const withdrawTokenContract = getContract({
        address: withdrawTokenAddress as `0x${string}`,
        abi: ERC20ABI,
        client: {
          public: publicClient,
          // viem doesn't like to get wallet field as zerodev kernelClient but it can to (https://docs.zerodev.app/sdk/core-api/send-transactions)
          wallet: kernelClient as unknown as Client,
        },
      });

      const withdrawTokenUserBalance =
        (await withdrawTokenContract.read.balanceOf([userAddress])) as bigint;

      const defiClient = createKernelDefiClient(kernelClient, ZERODEV_API_KEY);

      const swapToUSDCUserOpHash = await defiClient.sendSwapUserOp({
        fromToken: withdrawTokenAddress,
        fromAmount: withdrawTokenUserBalance,
        toToken: baseTokenAddresses[arbitrum.id].USDC,

        gasToken: 'sponsored',
      });

      const swapToUSDCReceipt = await bundlerClient.waitForUserOperationReceipt(
        {
          hash: swapToUSDCUserOpHash,
        },
      );

      console.log('swapToUSDCReceipt: ', swapToUSDCReceipt);
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
