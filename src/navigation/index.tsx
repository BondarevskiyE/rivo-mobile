import React from 'react';
import {NavigationContainer} from '@react-navigation/native';

import {AppStack} from './AppStack';
import {AuthStack} from './AuthStack';

import {createStackNavigator} from '@react-navigation/stack';
import {useUserStore} from '@/store/useUserStore';
import {useIsMounted} from '@/shared/hooks';

const Stack = createStackNavigator();
const RootStack = createStackNavigator();

export const Router = () => {
  const isMounted = useIsMounted();
  const isLoggedIn = useUserStore(state => state.isLoggedIn);

  if (!isMounted) {
    return null;
  }

  return (
    <NavigationContainer>
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
            name="App"
            component={AppStack}
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
