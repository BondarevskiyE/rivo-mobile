import Web3Auth, {
  OPENLOGIN_NETWORK,
  ChainNamespace,
  LOGIN_PROVIDER_TYPE,
} from '@web3auth/react-native-sdk';
import * as WebBrowser from '@toruslabs/react-native-web-browser';
import EncryptedStorage from 'react-native-encrypted-storage';
import Config from 'react-native-config';

import {EthereumPrivateKeyProvider} from '@web3auth/ethereum-provider';

import {providerToSmartAccountSigner} from 'permissionless';

import {getDeepLink} from '@/shared/lib';
import {Alert} from 'react-native';
import {getPrivateKeyFromKeyChain, savePrivateKeyInKeychain} from '../keychain';

const WEB3AUTH_API_KEY = Config.WEB3AUTH_API_KEY;

const redirectUrl = getDeepLink('openlogin');

const SdkInitParams = {
  clientId: WEB3AUTH_API_KEY,
  network: OPENLOGIN_NETWORK.SAPPHIRE_DEVNET,
  redirectUrl,
};
// arbitrum mainnet
// const chainConfig = {
//   chainNamespace: 'eip155',
//   chainId: '0xA4B1', // hex of 42161
//   rpcTarget: 'https://rpc.ankr.com/arbitrum',
//   // Avoid using public rpcTarget in production.
//   // Use services like Infura, Quicknode etc
//   displayName: 'Arbitrum Mainnet',
//   blockExplorer: 'https://arbiscan.io',
//   ticker: 'AETH',
//   tickerName: 'AETH',
// };
// arbitrum testnet
const chainConfig = {
  chainNamespace: ChainNamespace.EIP155,
  chainId: '0x66eee', // Hex of 421614
  // Avoid using public rpcTarget in production.
  // Use services like Infura, Quicknode etc
  rpcTarget: 'https://rpc.ankr.com/arbitrum_sepolia',
  displayName: 'Arbitrum Sepolia Testnet',
  blockExplorer: 'https://sepolia.arbiscan.io/',
  ticker: 'AETH',
  tickerName: 'AETH',
};

const ethereumPrivateKeyProvider = new EthereumPrivateKeyProvider({
  config: {
    chainConfig,
  },
});

export const web3auth = new Web3Auth(
  WebBrowser,
  EncryptedStorage,
  SdkInitParams,
);

export const initWeb3Auth = async () => {
  try {
    // IMP START - SDK Initialization
    await web3auth.init();

    if (web3auth.privKey) {
      await ethereumPrivateKeyProvider.setupProvider(web3auth.privKey);

      // IMP END - SDK Initialization
    }
  } catch (error) {
    console.log(error);
  }
};

export const web3AuthLogin = async (loginProvider: LOGIN_PROVIDER_TYPE) => {
  try {
    await initWeb3Auth();

    if (!web3auth.ready) {
      throw new Error('web3auth is not ready');
    }

    await web3auth.login({
      loginProvider,
      redirectUrl,
    });

    if (web3auth.privKey) {
      const user = web3auth.userInfo();

      savePrivateKeyInKeychain(
        user?.email || (user?.name as string),
        web3auth.privKey,
      );

      await ethereumPrivateKeyProvider.setupProvider(web3auth.privKey);

      const smartAccountSigner = await providerToSmartAccountSigner(
        // @ts-ignore
        ethereumPrivateKeyProvider,
      );

      return {smartAccountSigner, user};
    }
    throw new Error('something went wrong');
  } catch (e: any) {
    console.log(e);
    throw new Error(e);
  }
};

export const web3AuthReconnect = async () => {
  try {
    await initWeb3Auth();

    if (!web3auth.ready) {
      throw new Error('web3auth is not ready');
    }

    const keychainResult = await getPrivateKeyFromKeyChain();

    if (keychainResult) {
      const privKey = keychainResult.password;

      await ethereumPrivateKeyProvider.setupProvider(privKey);

      const smartAccountSigner = await providerToSmartAccountSigner(
        // @ts-ignore
        ethereumPrivateKeyProvider,
      );

      return smartAccountSigner;
    }
    return null;
  } catch (e: any) {
    console.log(e);
    throw new Error(e);
  }
};

export const logoutWeb3Auth = async () => {
  try {
    await initWeb3Auth();

    if (!web3auth.ready) {
      throw new Error('web3auth is not ready');
    }
    if (web3auth.privKey) {
      // IMP START - Logout
      await web3auth.logout();
      // IMP END - Logout
    }

    //   resetCredentials();

    if (!web3auth.privKey) {
      return true;
    } else {
      throw new Error('something went wrong with logging out');
    }
  } catch (error: any) {
    // FIX any
    console.log(error);
    Alert.alert(error.message);
    return false;
  }
};
