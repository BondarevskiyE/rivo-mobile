import {TransitionPresets, createStackNavigator} from '@react-navigation/stack';

import {PROFILE_SCREENS, ProfileStackProps} from './types/profileStack';
import {ProfileMenuScreen} from '@/screens/profile/ProfileMenuScreen';
import {SettingsMenuScreen} from '@/screens/profile/SettingsMenuScreen';
import {HelpAndSupportScreen} from '@/screens/profile/HelpAndSupportScreen';
import {moveBottomToTop} from './StyleInterpolators';
import {AboutRivoScreen} from '@/screens/profile/AboutRivoScreen';
import {ChangePasscodeScreen} from '@/screens/profile/ChangePasscodeScreen';

const Stack = createStackNavigator<ProfileStackProps>();

export const ProfileStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        gestureEnabled: false,
        headerShown: false,
      }}>
      <Stack.Screen
        name={PROFILE_SCREENS.PROFILE_MENU}
        component={ProfileMenuScreen}
        options={{
          ...TransitionPresets.SlideFromRightIOS,
        }}
      />
      <Stack.Screen
        name={PROFILE_SCREENS.SETTINGS_MENU}
        component={SettingsMenuScreen}
        options={{
          ...TransitionPresets.SlideFromRightIOS,
        }}
      />
      <Stack.Screen
        name={PROFILE_SCREENS.HELP_AND_SUPPORT}
        component={HelpAndSupportScreen}
        options={{
          transitionSpec: {
            open: {
              animation: 'timing',
              config: {
                duration: 300,
              },
            },
            close: {
              animation: 'timing',
              config: {
                duration: 300,
              },
            },
          },
          cardStyleInterpolator: moveBottomToTop,
        }}
      />
      <Stack.Screen
        name={PROFILE_SCREENS.ABOUT_RIVO}
        component={AboutRivoScreen}
        options={{
          ...TransitionPresets.SlideFromRightIOS,
        }}
      />
      <Stack.Screen
        name={PROFILE_SCREENS.CHANGE_PASSCODE}
        component={ChangePasscodeScreen}
        options={{
          ...TransitionPresets.SlideFromRightIOS,
        }}
      />
    </Stack.Navigator>
  );
};
