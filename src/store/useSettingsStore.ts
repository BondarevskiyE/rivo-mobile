import {create} from 'zustand';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {persist, createJSONStorage} from 'zustand/middleware';
import {BIOMETRY_TYPE} from 'react-native-keychain';

interface SettingsState {
  isBiometryEnabled: boolean;
  // if it is null it is unsupported
  biometryType: BIOMETRY_TYPE | null;
  isNotificationsEnabled: boolean;
  isEmailNotificationsEnabled: boolean;
  isSystemAlertOpen: boolean;
  setIsSystemAlertOpen: (bool: boolean) => void;
  setIsNotificationsEnabled: (bool: boolean) => void;
  setIsEmailNotificationsEnabled: (bool: boolean) => void;
  setIsBiometryEnabled: (bool: boolean) => void;
  setBiometryType: (type: BIOMETRY_TYPE | null) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      isBiometryEnabled: false,
      isNotificationsEnabled: false,
      isEmailNotificationsEnabled: true,
      biometryType: null,
      isSystemAlertOpen: false,
      setIsSystemAlertOpen: (bool: boolean) => set({isSystemAlertOpen: bool}),
      setIsNotificationsEnabled: (bool: boolean) =>
        set({isNotificationsEnabled: bool}),
      setIsEmailNotificationsEnabled: (bool: boolean) =>
        set({isEmailNotificationsEnabled: bool}),
      setIsBiometryEnabled: (bool: boolean) => set({isBiometryEnabled: bool}),
      setBiometryType: (type: BIOMETRY_TYPE | null) =>
        set({biometryType: type}),
    }),
    {
      name: 'settings-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        isBiometryEnabled: state.isBiometryEnabled,
        biometryType: state.biometryType,
        isNotificationsEnabled: state.isNotificationsEnabled,
        isEmailNotificationsEnabled: state.isEmailNotificationsEnabled,
      }),
    },
  ),
);
