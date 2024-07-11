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

const WEB3AUTH_API_KEY = Config.WEB3AUTH_API_KEY;

const redirectUrl = getDeepLink('openlogin');

const SdkInitParams = {
  clientId: WEB3AUTH_API_KEY,
  network: OPENLOGIN_NETWORK.SAPPHIRE_DEVNET,
  redirectUrl,
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
      console.log('web3auth.privKey: ', web3auth.privKey);
      const user = web3auth.userInfo();

      console.log('user: ', user);

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

export const logoutWeb3Auth = async () => {
  try {
    await initWeb3Auth();

    if (!web3auth.ready) {
      throw new Error('web3auth is not ready');
    }
    // IMP START - Logout
    await web3auth.logout();
    // IMP END - Logout

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
