import {create} from 'zustand';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {persist, createJSONStorage} from 'zustand/middleware';
import {BIOMETRY_TYPE} from 'react-native-keychain';

interface SettingsState {
  isBiometryEnabled: boolean;
  biometryType: BIOMETRY_TYPE | null;
  isNotificationsEnabled: boolean;
  isNotificationsDetermined: boolean;
  isSystemAlertOpen: boolean;
  setIsSystemAlertOpen: (bool: boolean) => void;
  setIsNotificationsEnabled: (bool: boolean) => void;
  setIsNotificationsDetermined: (bool: boolean) => void;
  setIsBiometryEnabled: (bool: boolean, type?: BIOMETRY_TYPE) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      isBiometryEnabled: false,
      isNotificationsEnabled: false,
      isNotificationsDetermined: false,
      biometryType: null,
      isSystemAlertOpen: false,
      setIsSystemAlertOpen: (bool: boolean) => set({isSystemAlertOpen: bool}),
      setIsNotificationsEnabled: (bool: boolean) =>
        set({isNotificationsEnabled: bool}),
      setIsNotificationsDetermined: (bool: boolean) =>
        set({isNotificationsDetermined: bool}),
      setIsBiometryEnabled: (bool: boolean, type?: BIOMETRY_TYPE) =>
        set({isBiometryEnabled: bool, biometryType: type || null}),
    }),
    {
      name: 'settings-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        isBiometryEnabled: state.isBiometryEnabled,
        biometryType: state.biometryType,
        isNotificationsEnabled: state.isNotificationsEnabled,
        isNotificationsDetermined: state.isNotificationsDetermined,
      }),
    },
  ),
);
