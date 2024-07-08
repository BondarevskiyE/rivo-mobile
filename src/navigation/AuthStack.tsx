import React from 'react';
import {createStackNavigator, TransitionPresets} from '@react-navigation/stack';
import {StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Colors} from '@/shared/ui';
import {
  LoginScreen,
  CardCreatingScreen,
  EnableNotificationsScreen,
  PassCodeRegistrationScreen,
} from '@/screens';

export enum AUTH_SCREENS {
  LOGIN = 'login',
  CARD_CREATING = 'card_creating',
  ENABLE_NOTIFICATIONS = 'enable_notifications',
  PASS_CODE_REGISTRATION = 'passcode_registration',
}

export type AuthStackProps = {
  [AUTH_SCREENS.LOGIN]: undefined;
  [AUTH_SCREENS.CARD_CREATING]: undefined;
  [AUTH_SCREENS.PASS_CODE_REGISTRATION]: undefined;
  [AUTH_SCREENS.ENABLE_NOTIFICATIONS]: undefined;
};

const Stack = createStackNavigator<AuthStackProps>();

export const AuthStack = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Navigator
        screenOptions={{
          gestureEnabled: false,
          headerShown: false,
          ...TransitionPresets.SlideFromRightIOS,
        }}>
        <Stack.Screen name={AUTH_SCREENS.LOGIN} component={LoginScreen} />
        <Stack.Screen
          name={AUTH_SCREENS.CARD_CREATING}
          component={CardCreatingScreen}
          options={{animationEnabled: false}}
        />
        <Stack.Screen
          name={AUTH_SCREENS.PASS_CODE_REGISTRATION}
          component={PassCodeRegistrationScreen}
          options={{animationEnabled: false}}
        />
        <Stack.Screen
          name={AUTH_SCREENS.ENABLE_NOTIFICATIONS}
          component={EnableNotificationsScreen}
          options={{animationEnabled: false}}
        />
      </Stack.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ui_background,
  },
});
