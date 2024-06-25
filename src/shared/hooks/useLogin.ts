import {useEffect, useState} from 'react';

import Web3Auth, {
  OPENLOGIN_NETWORK,
  LOGIN_PROVIDER,
  ChainNamespace,
  LOGIN_PROVIDER_TYPE,
  ExtraLoginOptions,
  TypeOfLogin,
} from '@web3auth/react-native-sdk';
import * as WebBrowser from '@toruslabs/react-native-web-browser';
import EncryptedStorage from 'react-native-encrypted-storage';

import {EthereumPrivateKeyProvider} from '@web3auth/ethereum-provider';

import {signerToEcdsaValidator} from '@zerodev/ecdsa-validator';
import {
  providerToSmartAccountSigner,
  ENTRYPOINT_ADDRESS_V07,
} from 'permissionless';
import {createPublicClient, http} from 'viem';
import {arbitrum} from 'viem/chains';
import {
  createKernelAccount,
  createKernelAccountClient,
  createZeroDevPaymasterClient,
} from '@zerodev/sdk';

import {BUNDLER_RPC, PAYMASTER_RPC} from '../constants';

import {useUserStore} from '@/store/useUserStore';
import {LOGIN_STEPS, useLoginStore} from '@/store/useLoginStore';
import {resetCredentials} from '../lib/keychain';

const scheme = 'rivomobile';
const redirectUrl = `${scheme}://openlogin`;

const entryPoint = ENTRYPOINT_ADDRESS_V07;
const chain = arbitrum;

const SdkInitParams = {
  clientId:
    'BEdj7U63xHVU5MReu7tqXGOi8rfeDNpieP27_9B70ia45Gcdu9LkyqI2ysdAhXUkdoK60uWSgVOTh_AexEpshCM',
  network: OPENLOGIN_NETWORK.SAPPHIRE_MAINNET,
  redirectUrl,
  loginConfig: {
    twitter: {
      verifier: 'twitter', // get it from web3auth dashboard for auth0 configuration
      typeOfLogin: 'twitter' as TypeOfLogin,
      clientId: 'K6NSh9IjJUgY53fk8Tcz6FBXZTWc0mvA', // get it from auth0 dashboard
    },
  },
};

const chainConfig = {
  chainNamespace: ChainNamespace.EIP155,
  chainId: '0xaa36a7',
  rpcTarget: 'https://rpc.ankr.com/eth_sepolia',
  // Avoid using public rpcTarget in production.
  // Use services like Infura, Quicknode etc
  displayName: 'Ethereum Sepolia Testnet',
  blockExplorerUrl: 'https://sepolia.etherscan.io',
  ticker: 'ETH',
  tickerName: 'Ethereum',
  decimals: 18,
  logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
};

const ethereumPrivateKeyProvider = new EthereumPrivateKeyProvider({
  config: {
    chainConfig,
  },
});

const web3auth = new Web3Auth(WebBrowser, EncryptedStorage, SdkInitParams);

export const useLogin = () => {
  const [provider, setProvider] = useState<EthereumPrivateKeyProvider | null>(
    null,
  );
  const [AAClient, setAAClient] = useState<any>(null);

  const {setIsLoggedIn, setUserInfo, setWalletAddress} = useUserStore();

  const {setIsLoading, setLoginStep} = useLoginStore();

  useEffect(() => {
    const init = async () => {
      // IMP START - SDK Initialization
      await web3auth.init();

      if (web3auth.privKey) {
        await ethereumPrivateKeyProvider.setupProvider(web3auth.privKey);
        // IMP END - SDK Initialization
        setProvider(ethereumPrivateKeyProvider);
      }
    };
    init();
  }, []);

  const login = async (loginProvider: LOGIN_PROVIDER_TYPE) => {
    try {
      if (!web3auth.ready) {
        return;
      }
      setLoginStep(LOGIN_STEPS.AUTH);
      setIsLoading(true);

      const extraLoginOptions: ExtraLoginOptions =
        loginProvider === LOGIN_PROVIDER.TWITTER
          ? {
              domain: 'https://dev-508d8dsh6blcxkmg.us.auth0.com',
              verifierIdField: 'sub',
              redirect_uri: redirectUrl,
            }
          : {};
      // IMP START - Login
      await web3auth.login({
        loginProvider,
        redirectUrl,
        extraLoginOptions,
      });
      if (web3auth.privKey) {
        const user = web3auth.userInfo();
        setUserInfo({
          name: user?.name || '',
          email: user?.email || '',
        });
        setLoginStep(LOGIN_STEPS.CARD_CREATING);
        await ethereumPrivateKeyProvider.setupProvider(web3auth.privKey);
        // IMP END - Login
        setProvider(ethereumPrivateKeyProvider);

        const smartAccountSigner = await providerToSmartAccountSigner(
          // @ts-ignore
          ethereumPrivateKeyProvider,
        );

        const publicClient = createPublicClient({
          transport: http(BUNDLER_RPC),
        });

        const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
          signer: smartAccountSigner,
          entryPoint,
        });

        const account = await createKernelAccount(publicClient, {
          plugins: {
            sudo: ecdsaValidator,
          },
          entryPoint,
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

        setAAClient(kernelClient);
        setWalletAddress(kernelClient.account.address);
        setIsLoading(false);
      }
    } catch (e: any) {
      console.log(e);
    }
  };

  const logout = async () => {
    if (!web3auth.ready) {
      return;
    }

    // IMP START - Logout
    await web3auth.logout();
    // IMP END - Logout

    resetCredentials();

    if (!web3auth.privKey) {
      setProvider(null);
      setIsLoggedIn(false);
      setUserInfo({});
      setWalletAddress('');
    }
  };

  return {
    login,
    logout,
    provider,
    AAClient,
  };
};
