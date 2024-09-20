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
import {AuthStackProps, AUTH_SCREENS} from './types/authStack';

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
        />
        <Stack.Screen
          name={AUTH_SCREENS.PASS_CODE_REGISTRATION}
          component={PassCodeRegistrationScreen}
        />
        <Stack.Screen
          name={AUTH_SCREENS.ENABLE_NOTIFICATIONS}
          component={EnableNotificationsScreen}
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
