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

import {providerToSmartAccountSigner} from 'permissionless';

import {useUserStore} from '@/store/useUserStore';
import {useLoginStore} from '@/store/useLoginStore';
// import {resetCredentials} from '../';
import {getDeepLink} from '../utilities';
// import {SmartAccountSigner} from 'permissionless/accounts';

// const scheme = 'rivomobile';
const redirectUrl = getDeepLink();
// const redirectUrlTwitter = getDeepLink('twitter');

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

export const initWeb3Auth = async () => {
  // IMP START - SDK Initialization
  await web3auth.init();

  if (web3auth.privKey) {
    await ethereumPrivateKeyProvider.setupProvider(web3auth.privKey);
    // IMP END - SDK Initialization
  }
};

export const login = async (loginProvider: LOGIN_PROVIDER_TYPE) => {
  const {} = useUserStore.getState();
  const {} = useLoginStore.getState();
  try {
    if (!web3auth.ready) {
      throw new Error('web3auth is not ready');
    }
    // setLoginStep(LOGIN_STEPS.AUTH);
    // setIsLoading(true);

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
      //   setUserInfo({
      //     name: user?.name || '',
      //     email: user?.email || '',
      //   });
      //   setLoginStep(LOGIN_STEPS.CARD_CREATING);
      await ethereumPrivateKeyProvider.setupProvider(web3auth.privKey);
      // IMP END - Login
      //   setProvider(ethereumPrivateKeyProvider);

      const smartAccountSigner = await providerToSmartAccountSigner(
        // @ts-ignore
        ethereumPrivateKeyProvider,
      );

      return {smartAccountSigner, user};

      //   setAAClient(kernelClient);
      //   setWalletAddress(kernelClient.account.address);
      //   setIsLoading(false);
    }
    throw new Error('something went wrong');
  } catch (e: any) {
    console.log(e);
    throw new Error(e);
  }
};

export const logoutWeb3Auth = async () => {
  if (!web3auth.ready) {
    return;
  }

  // IMP START - Logout
  await web3auth.logout();
  // IMP END - Logout

  //   resetCredentials();

  if (!web3auth.privKey) {
    // setIsLoggedIn(false);
    // setUserInfo({});
    // setWalletAddress('');
  }
};
