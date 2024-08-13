import {signerToEcdsaValidator} from '@zerodev/ecdsa-validator';
import {ENTRYPOINT_ADDRESS_V07} from 'permissionless';
import {createPublicClient, http} from 'viem';
import {arbitrum} from 'viem/chains';
import {
  createKernelAccount,
  createKernelAccountClient,
  createZeroDevPaymasterClient,
} from '@zerodev/sdk';
import {KERNEL_V3_1} from '@zerodev/sdk/constants';

// import {createPimlicoPaymasterClient} from 'permissionless/clients/pimlico';

import {BUNDLER_RPC, PAYMASTER_RPC} from '@/shared/constants';
import {SmartAccountSigner} from 'permissionless/accounts';

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
