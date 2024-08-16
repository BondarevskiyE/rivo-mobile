import {Alert} from 'react-native';
import {signerToEcdsaValidator} from '@zerodev/ecdsa-validator';
import {ENTRYPOINT_ADDRESS_V07, bundlerActions} from 'permissionless';
import {Abi, createPublicClient, encodeFunctionData, http} from 'viem';
import {arbitrum} from 'viem/chains';
import {
  createKernelAccount,
  createKernelAccountClient,
  createZeroDevPaymasterClient,
} from '@zerodev/sdk';
import {KERNEL_V3_1} from '@zerodev/sdk/constants';
import {createKernelDefiClient, baseTokenAddresses} from '@zerodev/defi';

// import {createPimlicoPaymasterClient} from 'permissionless/clients/pimlico';

import {
  BUNDLER_RPC,
  PAYMASTER_RPC,
  USDC_DECIMALS,
  ZERODEV_API_KEY,
} from '@/shared/constants';
import {SmartAccountSigner} from 'permissionless/accounts';
import {useZeroDevStore} from '@/store/useZeroDevStore';
import {getTokenValueBigInt} from '@/shared/lib/bigInt';
import ERC20ABI from '@/abis/ERC20.json';
import {KernelClient} from '@/store/types';
import {fetchPendleStruct} from '@/shared/api/vault';
import {getContract} from '../viem';

export const entryPoint = ENTRYPOINT_ADDRESS_V07;

export const chain = arbitrum;

export const initZeroDevClient = async (
  smartAccountSigner: SmartAccountSigner<'custom', `0x${string}`>,
) => {
  const publicClient = createPublicClient({
    transport: http(BUNDLER_RPC),
  });

  const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
    signer: smartAccountSigner,
    entryPoint,
    kernelVersion: KERNEL_V3_1,
  });

  const account = await createKernelAccount(publicClient, {
    plugins: {
      sudo: ecdsaValidator,
    },
    entryPoint,
    kernelVersion: KERNEL_V3_1,
  });

  const kernelClient = createKernelAccountClient({
    account,
    chain,
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    bundlerTransport: http(BUNDLER_RPC),
    middleware: {
      sponsorUserOperation: async ({userOperation}) => {
        const zerodevPaymaster = createZeroDevPaymasterClient({
          chain,
          entryPoint,
          transport: http(PAYMASTER_RPC),
        });
        return zerodevPaymaster.sponsorUserOperation({
          userOperation,
          entryPoint,
        });
      },
    },
  });

  return kernelClient;
};

interface SwapUsdcToTokenParams {
  toTokenAddress: string;
  amount: string;
}

export const swapUsdcToToken = async ({
  toTokenAddress,
  amount,
}: SwapUsdcToTokenParams) => {
  try {
    const kernelClient = useZeroDevStore.getState().kernelClient;

    if (!kernelClient) {
      throw new Error('no kernelClient');
    }

    const defiClient = createKernelDefiClient(kernelClient, ZERODEV_API_KEY);

    const userOpHash = await defiClient.sendSwapUserOp({
      fromToken: baseTokenAddresses[arbitrum.id].USDC,
      fromAmount: getTokenValueBigInt(amount, USDC_DECIMALS),
      toToken: toTokenAddress,

      gasToken: 'sponsored',
    });

    // @ts-ignore
    const bundlerClient = await kernelClient.extend(bundlerActions(entryPoint));
    const receipt = await bundlerClient.waitForUserOperationReceipt({
      hash: userOpHash,
    });

    return receipt;
  } catch (error) {
    console.log(error);
    Alert.alert(`swapUsdcToToken error: ${error}`);
  }
};

interface SwapTokenToUsdcParams {
  fromTokenAddress: string;
  amount: bigint;
}

export const swapTokenToUsdc = async ({
  fromTokenAddress,
  amount,
}: SwapTokenToUsdcParams) => {
  try {
    const kernelClient = useZeroDevStore.getState().kernelClient;

    if (!kernelClient) {
      throw new Error('no kernelClient');
    }

    const defiClient = createKernelDefiClient(kernelClient, ZERODEV_API_KEY);

    const swapToUSDCUserOpHash = await defiClient.sendSwapUserOp({
      fromToken: fromTokenAddress,
      fromAmount: amount,
      toToken: baseTokenAddresses[arbitrum.id].USDC,

      gasToken: 'sponsored',
    });
    // @ts-ignore
    const bundlerClient = await kernelClient.extend(bundlerActions(entryPoint));
    const receipt = await bundlerClient.waitForUserOperationReceipt({
      hash: swapToUSDCUserOpHash,
    });

    return receipt;
  } catch (error) {
    console.log(error);
    Alert.alert(`swapUsdcToToken error: ${error}`);
  }
};

interface InvestUserOperationParams {
  investTokenAddress: `0x${string}`;
  vaultTokenContractAddress: `0x${string}`;
  vaultTokenContractAbi: Abi | unknown[];
  investAmount: bigint;
}

export const sendInvestUserOperation = async ({
  investTokenAddress,
  vaultTokenContractAddress,
  vaultTokenContractAbi,
  investAmount,
}: InvestUserOperationParams) => {
  const kernelClient = useZeroDevStore.getState().kernelClient as KernelClient;

  if (!kernelClient) {
    throw new Error('no kernelClient');
  }

  const investUserOperationData = {
    callData: await kernelClient.account.encodeCallData([
      {
        to: investTokenAddress,
        value: BigInt(0),
        data: encodeFunctionData({
          abi: ERC20ABI,
          functionName: 'approve',
          args: [vaultTokenContractAddress, investAmount],
        }),
      },
      {
        to: vaultTokenContractAddress,
        value: BigInt(0),
        data: encodeFunctionData({
          abi: vaultTokenContractAbi,
          functionName: 'deposit',
          args: [investAmount],
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

  // @ts-ignore
  const bundlerClient = await kernelClient.extend(bundlerActions(entryPoint));

  const investTxReceipt = await bundlerClient.waitForUserOperationReceipt({
    hash: userOpInvestTxHash,
  });

  return investTxReceipt;
};

interface WithdrawUserOperationParams {
  vaultAddress: `0x${string}`;
  vaultAbi: Abi | unknown[];
  vaultTokenContractAddress: `0x${string}`;
  vaultTokenContractAbi: Abi | unknown[];
  withdrawAmount: string;
  userAddress: `0x${string}`;
  strategiesAddresses: `0x${string}`[];
}

export const sendWithdrawUserOperation = async ({
  vaultAddress,
  vaultAbi,
  withdrawAmount,
  vaultTokenContractAddress,
  vaultTokenContractAbi,
  userAddress,
  strategiesAddresses,
}: WithdrawUserOperationParams) => {
  const kernelClient = useZeroDevStore.getState().kernelClient as KernelClient;

  const pendleStruct = await fetchPendleStruct(strategiesAddresses);

  if (!kernelClient || !pendleStruct) {
    throw new Error('no kernelClient');
  }
  const vaultContract = getContract({
    contractAddress: vaultAddress,
    abi: vaultAbi,
  });

  const vaultDecimals = (await vaultContract.read.decimals()) as number;

  const preparedValue = +withdrawAmount * 10 ** vaultDecimals;

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
        to: vaultTokenContractAddress,
        value: BigInt(0),
        data: encodeFunctionData({
          abi: vaultTokenContractAbi,
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
      callGasLimit: (withdrawUserOp.callGasLimit * BigInt(104)) / BigInt(100),
    },
    // @ts-ignore FIX why type is incompitible
    account: kernelClient.account,
  });

  // @ts-ignore
  const bundlerClient = kernelClient.extend(bundlerActions(entryPoint));
  const withdrawTxReceipt = await bundlerClient.waitForUserOperationReceipt({
    hash: userOpWithdrawTxHash,
  });

  return withdrawTxReceipt;
};
