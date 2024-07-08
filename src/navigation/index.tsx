import React from 'react';
import {DefaultTheme, NavigationContainer} from '@react-navigation/native';

import {navigationRef} from './RootNavigation';

import {HomeStack} from './HomeStack';
import {AuthStack} from './AuthStack';

import {createStackNavigator} from '@react-navigation/stack';
import {useUserStore} from '@/store/useUserStore';

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
};

const Stack = createStackNavigator();
const RootStack = createStackNavigator();

export const Router = () => {
  const isLoggedIn = useUserStore(state => state.isLoggedIn);

  return (
    <NavigationContainer theme={navTheme} ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          gestureEnabled: true,
          headerShown: false,
        }}>
        {!isLoggedIn ? (
          <RootStack.Screen
            name="Auth"
            component={AuthStack}
            options={{
              animationEnabled: false,
            }}
          />
        ) : (
          <RootStack.Screen
            name="Home"
            component={HomeStack}
            options={{
              animationEnabled: false,
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Router;
