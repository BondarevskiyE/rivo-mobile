import {create} from 'zustand';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {persist, createJSONStorage} from 'zustand/middleware';

interface SettingsState {
  isBiometryEnabled: boolean;
  setIsBiometryEnabled: (bool: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      isBiometryEnabled: false,
      setIsBiometryEnabled: (bool: boolean) => set({isBiometryEnabled: bool}),
    }),
    {
      name: 'settings-state',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
