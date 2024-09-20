import * as RootNavigation from '@/navigation/RootNavigation';
import {
  ActionMenuButton,
  ButtonType,
} from '@/components/MenuActionButtons/types';
import {ChangePasscodeIcon} from '@/shared/ui/icons/ChangePasscodeIcon';
import {PROFILE_SCREENS} from '@/navigation/types/profileStack';
import {
  getCredentialsWithPassword,
  isFaceBiometry,
  saveCredentialsWithBiometry,
} from '@/services/keychain';
import {useSettingsStore} from '@/store/useSettingsStore';
import {ExitIcon, FaceIdIcon} from '@/shared/ui/icons';
import {TouchIdIcon} from '@/shared/ui/icons/TouchIdIcon';
import {getBiometryName} from '@/shared/helpers/name';
import {MailIcon} from '@/shared/ui/icons/MailIcon';
import {BellLineIcon} from '@/shared/ui/icons/BellLineIcon';
import {useLoginStore} from '@/store/useLoginStore';
import {AsyncAlert} from '@/components';
import {EPermissionTypes, usePermissions} from '@/shared/hooks/usePermissions';
import {RESULTS, openSettings} from 'react-native-permissions';
import {Alert} from 'react-native';
import {useUserStore} from '@/store/useUserStore';

export const getPasscodeButtons = (): ActionMenuButton[] => {
  const biometryType = useSettingsStore(state => state.biometryType);

  const {setIsBiometryEnabled, isBiometryEnabled} = useSettingsStore(state => ({
    setIsBiometryEnabled: state.setIsBiometryEnabled,
    isBiometryEnabled: state.isBiometryEnabled,
  }));

  const user = useUserStore(state => state.userInfo);

  const {askPermissions} = usePermissions(EPermissionTypes.BIOMETRY);

  const buttons: ActionMenuButton[] = [
    {
      title: 'Change passcode',
      type: ButtonType.INTERNAL,
      action: () => {
        RootNavigation.navigate(PROFILE_SCREENS.CHANGE_PASSCODE_SCREEN);
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
      action: async (boolean: boolean) => {
        if (!boolean) {
          setIsBiometryEnabled(false);
          return;
        }

        const credentials = await getCredentialsWithPassword();

        await askPermissions()
          .then(status => {
            if (
              user?.email &&
              credentials &&
              (status.type === RESULTS.LIMITED ||
                status.type === RESULTS.GRANTED)
            ) {
              // turn on internal state isBiometryEnabled
              setIsBiometryEnabled(true);
              saveCredentialsWithBiometry(user?.email, credentials?.password);
            }
          })
          .catch(error => {
            if ('isError' in error && error.isError) {
              Alert.alert(
                error.errorMessage ||
                  'Something went wrong while taking biometry permission',
              );
            }
            if ('type' in error) {
              if (
                error.type === RESULTS.BLOCKED ||
                error.type === RESULTS.DENIED
              ) {
                Alert.alert(
                  'Permissions are blocked',
                  `You need to turn on ${biometryName} in the app settings and try again in this menu`,
                  [
                    {
                      text: 'Close',
                    },
                    {
                      text: 'Go to  settings',
                      onPress: () => {
                        openSettings();
                      },
                    },
                  ],
                  {cancelable: false},
                );
              }
            }
          });
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

  const {askPermissions} = usePermissions(EPermissionTypes.PUSH_NOTIFICATIONS);

  const buttons: ActionMenuButton[] = [
    {
      title: 'Push notifications',
      type: ButtonType.SWITCH,
      isEnabled: isNotificationsEnabled,
      action: async (boolean: boolean) => {
        if (!boolean) {
          setIsNotificationsEnabled(false);
          return;
        }

        askPermissions()
          .then(status => {
            if (
              status.type === RESULTS.LIMITED ||
              status.type === RESULTS.GRANTED
            ) {
              // turn on internal state isNotificationsEnabled
              setIsNotificationsEnabled(true);
            }
          })
          .catch(error => {
            if ('isError' in error && error.isError) {
              Alert.alert(
                error.errorMessage ||
                  'Something went wrong while taking push notifications permission',
              );
            }
            if ('type' in error) {
              if (
                error.type === RESULTS.BLOCKED ||
                error.type === RESULTS.DENIED
              ) {
                Alert.alert(
                  'Permissions are blocked',
                  'You need to turn on push notifications in the app settings and try again in this menu',
                  [
                    {
                      text: 'Close',
                    },
                    {
                      text: 'Go to  settings',
                      onPress: () => {
                        openSettings();
                      },
                    },
                  ],
                  {cancelable: false},
                );
              }
            }
          });
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
