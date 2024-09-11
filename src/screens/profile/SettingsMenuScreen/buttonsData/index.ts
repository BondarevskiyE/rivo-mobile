import * as RootNavigation from '@/navigation/RootNavigation';
import {
  ActionMenuButton,
  ButtonType,
} from '@/components/MenuActionButtons/types';
import {ChangePasscodeIcon} from '@/shared/ui/icons/ChangePasscodeIcon';
import {PROFILE_SCREENS} from '@/navigation/types/profileStack';
import {isFaceBiometry} from '@/services/keychain';
import {useSettingsStore} from '@/store/useSettingsStore';
import {ExitIcon, FaceIdIcon} from '@/shared/ui/icons';
import {TouchIdIcon} from '@/shared/ui/icons/TouchIdIcon';
import {getBiometryName} from '@/shared/helpers/name';
import {MailIcon} from '@/shared/ui/icons/MailIcon';
import {BellLineIcon} from '@/shared/ui/icons/BellLineIcon';
import {useLoginStore} from '@/store/useLoginStore';
import {AsyncAlert} from '@/components';

export const getPasscodeButtons = (): ActionMenuButton[] => {
  const biometryType = useSettingsStore(state => state.biometryType);

  const {setIsBiometryEnabled, isBiometryEnabled} = useSettingsStore(state => ({
    setIsBiometryEnabled: state.setIsBiometryEnabled,
    isBiometryEnabled: state.isBiometryEnabled,
  }));

  const buttons: ActionMenuButton[] = [
    {
      title: 'Change passcode',
      type: ButtonType.INTERNAL,
      action: () => {
        RootNavigation.navigate(PROFILE_SCREENS.CHANGE_PASSCODE);
      },
      Icon: ChangePasscodeIcon,
    },
  ];

  if (biometryType) {
    const isFaceBiometryType = isFaceBiometry(biometryType);

    const biometryName = getBiometryName(biometryType);

    buttons.push({
      title: `Unlock with ${biometryName}`,
      type: ButtonType.SWITCH,
      isEnabled: isBiometryEnabled,
      action: (bool: boolean) => {
        setIsBiometryEnabled(bool);
      },
      Icon: isFaceBiometryType ? FaceIdIcon : TouchIdIcon,
    });
  }

  return buttons;
};

export const getPushNotificationButtons = (): ActionMenuButton[] => {
  const {
    setIsEmailNotificationsEnabled,
    isEmailNotificationsEnabled,
    isNotificationsEnabled,
    setIsNotificationsEnabled,
  } = useSettingsStore(state => ({
    isEmailNotificationsEnabled: state.isEmailNotificationsEnabled,
    setIsEmailNotificationsEnabled: state.setIsEmailNotificationsEnabled,
    isNotificationsEnabled: state.isNotificationsEnabled,
    setIsNotificationsEnabled: state.setIsNotificationsEnabled,
  }));

  const buttons: ActionMenuButton[] = [
    {
      title: 'Push notifications',
      type: ButtonType.SWITCH,
      isEnabled: isNotificationsEnabled,
      action: (boolean: boolean) => {
        setIsNotificationsEnabled(boolean);
      },
      Icon: BellLineIcon,
    },
    {
      title: 'Email notifications',
      type: ButtonType.SWITCH,
      isEnabled: isEmailNotificationsEnabled,
      action: (boolean: boolean) => {
        setIsEmailNotificationsEnabled(boolean);
      },
      Icon: MailIcon,
    },
  ];

  return buttons;
};

export const getLogoutButtons = () => {
  const logout = useLoginStore(state => state.logout);

  const onPressLogout = async () => {
    const isUserConfirmed = await AsyncAlert({
      title: 'Are you sure you want to exit?',
      resolveButtonText: 'Exit',
      rejectButtonText: 'No',
    });

    if (isUserConfirmed) {
      logout();
    }
  };

  return [
    {
      title: 'Log out',
      type: ButtonType.ACTION,
      action: onPressLogout,
      Icon: ExitIcon,
    },
  ];
};
