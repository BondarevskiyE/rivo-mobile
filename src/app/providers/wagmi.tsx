import React from 'react';
import {
  http,
  createConfig,
  WagmiProvider as Provider,
  createStorage,
  noopStorage,
} from 'wagmi';
import {withChildren} from '../types';
import {web3AuthZeroDevConnector} from '../connectors';

import Web3Auth, {
  OPENLOGIN_NETWORK,
  LOGIN_PROVIDER,
  ChainNamespace,
  TypeOfLogin,
} from '@web3auth/react-native-sdk';
import * as WebBrowser from '@toruslabs/react-native-web-browser';
import EncryptedStorage from 'react-native-encrypted-storage';
import {ENTRYPOINT_ADDRESS_V07} from 'permissionless';

// Chain
import {arbitrum} from 'viem/chains';
import {BUNDLER_RPC, PAYMASTER_RPC} from '../shared/constants';

const scheme = 'rivomobile';
const redirectUrl = `${scheme}://openlogin`;

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
  blockExplorer: 'https://sepolia.etherscan.io',
  ticker: 'ETH',
  tickerName: 'Ethereum',
  decimals: 18,
  logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
};

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}

const web3auth = new Web3Auth(WebBrowser, EncryptedStorage, SdkInitParams);

export const config = createConfig({
  chains: [arbitrum],
  transports: {
    [arbitrum.id]: http(BUNDLER_RPC),
  },
  storage: createStorage({
    storage: noopStorage,
  }),
  connectors: [
    web3AuthZeroDevConnector({
      web3AuthInstance: web3auth,
      loginParams: {
        loginProvider: LOGIN_PROVIDER.GOOGLE,
        redirectUrl,
      },
      zeroDevOptions: {
        entryPoint: ENTRYPOINT_ADDRESS_V07,
        chain: arbitrum,
        bundlerRPC: BUNDLER_RPC,
        paymasterRPC: PAYMASTER_RPC,
      },
      chainConfig,
      id: 'google',
    }),
  ],
});

export const WagmiProvider = ({children}: withChildren) => {
  return <Provider config={config}>{children}</Provider>;
};
