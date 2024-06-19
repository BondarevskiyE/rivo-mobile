import {
  ChainNotConfiguredError,
  createConnector,
  normalizeChainId,
} from '@wagmi/core';
import * as pkg from '@web3auth/base';
import {
  Chain,
  getAddress,
  HttpTransport,
  SwitchChainError,
  Transport,
  UserRejectedRequestError,
} from 'viem';
import {providerToSmartAccountSigner} from 'permissionless';
import {EthereumPrivateKeyProvider} from '@web3auth/ethereum-provider';
import {createPublicClient, http} from 'viem';
import {signerToEcdsaValidator} from '@zerodev/ecdsa-validator';
import {
  KernelAccountClient,
  KernelSmartAccount,
  createKernelAccount,
  createKernelAccountClient,
  createZeroDevPaymasterClient,
} from '@zerodev/sdk';

import type {Provider, Web3AuthZeroDevConnector} from './interfaces';
import {EntryPoint} from 'permissionless/types';

const {log} = pkg;

export function web3AuthZeroDevConnector(parameters: Web3AuthZeroDevConnector) {
  let web3AuthProvider: EthereumPrivateKeyProvider | null = null;
  let zeroDevClient: KernelAccountClient<
    EntryPoint,
    Transport,
    Chain,
    KernelSmartAccount<EntryPoint, HttpTransport, undefined>
  > | null = null;

  const {
    web3AuthInstance,
    loginParams,
    chainConfig,
    zeroDevOptions,
    id = 'web3authzerodev',
  } = parameters;

  return createConnector<Provider>(config => ({
    id,
    name: 'Web3AuthZeroDev',
    type: 'Web3AuthZeroDev',
    async connect({chainId} = {}) {
      try {
        config.emitter.emit('message', {
          type: 'connecting',
        });

        await web3AuthInstance.init();

        if (web3AuthInstance.ready) {
          if (loginParams) {
            await web3AuthInstance.login({
              loginProvider: loginParams.loginProvider,
              redirectUrl: loginParams.redirectUrl,
              extraLoginOptions: loginParams.extraLoginOptions,
            });
            if (web3AuthInstance.privKey) {
              const provider = await this.getProvider();

              provider.on('accountsChanged', this.onAccountsChanged);
              provider.on('chainChanged', this.onChainChanged);
              provider.on('disconnect', this.onDisconnect.bind(this));

              const smartAccountSigner = await providerToSmartAccountSigner(
                // @ts-ignore
                provider,
              );

              const publicClient = createPublicClient({
                transport: http(zeroDevOptions.bundlerRPC),
              });

              const ecdsaValidator = await signerToEcdsaValidator(
                publicClient,
                {
                  signer: smartAccountSigner,
                  entryPoint: zeroDevOptions.entryPoint,
                },
              );
              const account = await createKernelAccount(publicClient, {
                plugins: {
                  sudo: ecdsaValidator,
                },
                entryPoint: zeroDevOptions.entryPoint,
              });

              const kernelClient = createKernelAccountClient({
                account,
                chain: zeroDevOptions.chain,
                entryPoint: zeroDevOptions.entryPoint,
                bundlerTransport: http(zeroDevOptions.bundlerRPC),
                middleware: {
                  sponsorUserOperation: async ({userOperation}) => {
                    const zerodevPaymaster = createZeroDevPaymasterClient({
                      chain: zeroDevOptions.chain,
                      entryPoint: zeroDevOptions.entryPoint,
                      transport: http(zeroDevOptions.paymasterRPC),
                    });
                    return zerodevPaymaster.sponsorUserOperation({
                      userOperation,
                      entryPoint: zeroDevOptions.entryPoint,
                    });
                  },
                },
              });

              zeroDevClient = kernelClient;
            }
          } else {
            log.error('please provide valid loginParams');
            throw new UserRejectedRequestError(
              'please provide valid loginParams' as unknown as Error,
            );
          }
        }

        let currentChainId: number = await this.getChainId();
        if (chainId && currentChainId !== chainId) {
          const chain = await this.switchChain!({chainId}).catch(error => {
            if (error.code === UserRejectedRequestError.code) {
              throw error;
            }
            return {id: currentChainId};
          });
          currentChainId = chain?.id ?? currentChainId;
        }

        const accounts = await this.getAccounts();

        return {accounts, chainId: currentChainId};
      } catch (error) {
        log.error('error while connecting', error);
        this.onDisconnect();
        throw new UserRejectedRequestError(
          'Something went wrong' as unknown as Error,
        );
      }
    },
    async getAccounts() {
      if (zeroDevClient) {
        return [zeroDevClient.account.address];
      }
      return [];
    },
    async getChainId() {
      const provider = await this.getProvider();
      const chainId = await provider.request<unknown, number>({
        method: 'eth_chainId',
      });
      return normalizeChainId(chainId);
    },
    async getProvider(): Promise<Provider> {
      if (web3AuthProvider) {
        return web3AuthProvider;
      }
      const ethereumPrivateKeyProvider = new EthereumPrivateKeyProvider({
        config: {
          chainConfig,
        },
      });

      if (web3AuthInstance.ready && web3AuthInstance.privKey) {
        await ethereumPrivateKeyProvider.setupProvider(
          web3AuthInstance.privKey,
        );
      }

      web3AuthProvider = ethereumPrivateKeyProvider;
      return web3AuthProvider;
    },
    async isAuthorized() {
      try {
        const accounts = await this.getAccounts();
        return !!accounts.length;
      } catch {
        return false;
      }
    },
    // TODO think about the method realisation
    async switchChain({chainId}): Promise<Chain> {
      try {
        const chain = config.chains.find(x => x.id === chainId);
        if (!chain) {
          throw new SwitchChainError(new ChainNotConfiguredError());
        }
        const provider = await this.getProvider();
        provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{chainId}],
        });

        config.emitter.emit('change', {
          chainId,
        });
        return chain;
      } catch (error: unknown) {
        log.error('Error: Cannot change chain', error);
        throw new SwitchChainError(error as Error);
      }
    },
    async disconnect(): Promise<void> {
      if (!web3AuthInstance.ready) {
        return;
      }

      await web3AuthInstance.logout();
      const provider = await this.getProvider();
      provider.removeListener('accountsChanged', this.onAccountsChanged);
      provider.removeListener('chainChanged', this.onChainChanged);

      if (!web3AuthInstance.privKey) {
        web3AuthProvider = null;
        zeroDevClient = null;
      }
    },
    onAccountsChanged(accounts) {
      if (accounts.length === 0) {
        config.emitter.emit('disconnect');
      } else {
        config.emitter.emit('change', {
          accounts: accounts.map(x => getAddress(x)),
        });
      }
    },
    onChainChanged(chain) {
      const chainId = normalizeChainId(chain);
      config.emitter.emit('change', {chainId});
    },
    onDisconnect(): void {
      config.emitter.emit('disconnect');
    },
  }));
}
