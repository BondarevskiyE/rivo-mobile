import Web3Auth, {
  OPENLOGIN_NETWORK,
  LOGIN_PROVIDER,
  ChainNamespace,
  LOGIN_PROVIDER_TYPE,
  ExtraLoginOptions,
} from '@web3auth/react-native-sdk';
import * as WebBrowser from '@toruslabs/react-native-web-browser';
import EncryptedStorage from 'react-native-encrypted-storage';

import {EthereumPrivateKeyProvider} from '@web3auth/ethereum-provider';

import {providerToSmartAccountSigner} from 'permissionless';

import {getDeepLink} from '../utilities';
import {Alert} from 'react-native';
import {useLoginStore} from '@/store/useLoginStore';

const redirectUrl = getDeepLink('openlogin');

const SdkInitParams = {
  clientId:
    'BIsU9_iUz3sN83c0hI-xGGud5YFzteL1R35NgYE4GzOxs_fYbuVLQ7L4ewFfIRHcOcxBv4XRFUNbPZnon6OcK2Q',
  network: OPENLOGIN_NETWORK.SAPPHIRE_DEVNET,
  redirectUrl,
  loginConfig: {
    jwt: {
      verifier: 'YOUR_AUTH0_VERIFIER_NAME', // Please create a verifier on the developer dashboard and pass the name here
      typeOfLogin: 'jwt',
      clientId: 'AUTH0_CLIENT_ID_123ABcdefg4HiJKlMno4P5QR6stUvWXY', // use your app client id you got from auth0
    },
    twitter: {
      verifier: 'twittermobile', // get it from web3auth dashboard for auth0 configuration
      typeOfLogin: LOGIN_PROVIDER.TWITTER,
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

export const web3auth = new Web3Auth(
  WebBrowser,
  EncryptedStorage,
  SdkInitParams,
);

export const initWeb3Auth = async () => {
  // IMP START - SDK Initialization
  await web3auth.init();

  useLoginStore.setState({isWeb3AuthReady: true});

  if (web3auth.privKey) {
    await ethereumPrivateKeyProvider.setupProvider(web3auth.privKey);

    // IMP END - SDK Initialization
  }
};

export const web3AuthLogin = async (loginProvider: LOGIN_PROVIDER_TYPE) => {
  try {
    if (!web3auth.ready) {
      throw new Error('web3auth is not ready');
    }

    const extraLoginOptions: ExtraLoginOptions =
      loginProvider === LOGIN_PROVIDER.TWITTER
        ? {
            domain: 'https://dev-508d8dsh6blcxkmg.us.auth0.com',
            verifierIdField: 'sub',
            redirect_uri: redirectUrl,
          }
        : {};

    await web3auth.login({
      loginProvider,
      redirectUrl,
      extraLoginOptions,
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
