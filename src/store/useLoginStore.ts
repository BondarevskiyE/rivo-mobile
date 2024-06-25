import {create} from 'zustand';

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
}

export const useLoginStore = create<LoginState>()(set => ({
  isLoading: false,
  loginStep: LOGIN_STEPS.NONE,
  isPassCodeEntered: false,
  setIsPassCodeEntered: (bool: boolean) => set({isPassCodeEntered: bool}),
  setIsLoading: (bool: boolean) => set({isLoading: bool}),
  setLoginStep: (step: LOGIN_STEPS) => set({loginStep: step}),
}));
