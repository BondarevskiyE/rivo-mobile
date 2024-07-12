import {create} from 'zustand';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {persist, createJSONStorage} from 'zustand/middleware';

interface SettingsState {
  isBiometryEnabled: boolean;
  isNotificationsEnabled: boolean;
  isNotificationsDetermined: boolean;
  setIsNotificationsEnabled: (bool: boolean) => void;
  setIsNotificationsDetermined: (bool: boolean) => void;
  setIsBiometryEnabled: (bool: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      isBiometryEnabled: false,
      isNotificationsEnabled: false,
      isNotificationsDetermined: false,
      setIsNotificationsEnabled: (bool: boolean) =>
        set({isNotificationsEnabled: bool}),
      setIsNotificationsDetermined: (bool: boolean) =>
        set({isNotificationsDetermined: bool}),
      setIsBiometryEnabled: (bool: boolean) => set({isBiometryEnabled: bool}),
    }),
    {
      name: 'settings-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
