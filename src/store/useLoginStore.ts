import {create} from 'zustand';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {useUserStore} from './useUserStore';
import {resetKeychainCredentials} from '@/shared/lib/keychain';
import {signInWithTwitter} from '@/shared/lib/twitter';

GoogleSignin.configure({
  offlineAccess: true,
  iosClientId:
    '235832681635-3gr6a373koj6vl0ek64vlvtm6u4vrtjb.apps.googleusercontent.com',
  webClientId:
    '235832681635-c6jual4ctgrd7nvikti309cp8d7dqcmn.apps.googleusercontent.com',
});

export enum LOGIN_STEPS {
  NONE,
  AUTH,
  CARD_CREATING,
  PASSCODE_REGISTRATION,
  ENABLE_NOTIFICATIONS,
}

interface LoginState {
  isLoading: boolean;
  loginStep: LOGIN_STEPS;
  isPassCodeEntered: boolean;
  setIsPassCodeEntered: (bool: boolean) => void;
  setIsLoading: (bool: boolean) => void;
  setLoginStep: (step: LOGIN_STEPS) => void;

  loginGoogle: () => void;
  loginX: () => void;

  logout: () => void;
}

export const useLoginStore = create<LoginState>()(set => ({
  isLoading: false,
  loginStep: LOGIN_STEPS.NONE,
  isPassCodeEntered: false,
  setIsPassCodeEntered: (bool: boolean) => set({isPassCodeEntered: bool}),
  setIsLoading: (bool: boolean) => set({isLoading: bool}),
  setLoginStep: (step: LOGIN_STEPS) => set({loginStep: step}),

  loginGoogle: async () => {
    try {
      set({loginStep: LOGIN_STEPS.AUTH, isLoading: true});

      await GoogleSignin.hasPlayServices();

      const userInfo = await GoogleSignin.signIn();

      const {setUserInfo, setWalletAddress} = useUserStore.getState();

      setUserInfo(userInfo.user);

      set({loginStep: LOGIN_STEPS.CARD_CREATING});

      setTimeout(() => {
        setWalletAddress('0x30713a9895E150D73fB7676D054814d30266F8F1'); // FIX change to backend api response
        set({isLoading: false});
      }, 3000);

      return true;
    } catch (error) {
      console.log(`Google login error: ${error}`);
      return false;
    }
  },
  loginX: async () => {
    try {
      // set({loginStep: LOGIN_STEPS.AUTH, isLoading: true});
      signInWithTwitter();

      // const {setUserInfo, setWalletAddress} = useUserStore.getState();

      // setUserInfo(userInfo.user);

      // set({loginStep: LOGIN_STEPS.CARD_CREATING});

      // setTimeout(() => {
      //   setWalletAddress('0x30713a9895E150D73fB7676D054814d30266F8F1'); // FIX change to backend api response
      //   set({isLoading: false});
      // }, 3000);

      return true;
    } catch (error) {
      console.log(`X login error: ${error}`);
      return false;
    }
  },
  logout: async () => {
    try {
      await GoogleSignin.signOut();

      const {setUserInfo, setWalletAddress, setIsLoggedIn} =
        useUserStore.getState();
      setUserInfo(null);
      setWalletAddress('');
      setIsLoggedIn(false);
      resetKeychainCredentials();

      return true;
    } catch (error) {
      console.log(`Google logout error: ${error}`);
      return false;
    }
  },
}));
