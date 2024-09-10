import {DefaultTheme, NavigationContainer} from '@react-navigation/native';
import {TransitionPresets, createStackNavigator} from '@react-navigation/stack';

import {navigationRef} from './RootNavigation';

import {HomeStack} from './HomeStack';
import {AuthStack} from './AuthStack';

import {useUserStore} from '@/store/useUserStore';
import {ProfileStack} from './ProfileStack';
import {useLoginStore} from '@/store/useLoginStore';
import {PassCodeScreen} from '@/screens';
import {ROOT_STACKS} from './types/rootStack';

import {moveBottomToTop} from './StyleInterpolators';

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

  const isPassCodeEntered = useLoginStore(state => state.isPassCodeEntered);

  return (
    <NavigationContainer theme={navTheme} ref={navigationRef}>
      {
        // if user is logged in
        // we show PassCode screen every time the user collapse the application
        // see useAppState hook in App.tsx
      }
      {isLoggedIn && !isPassCodeEntered && <PassCodeScreen />}
      <Stack.Navigator
        screenOptions={{
          gestureEnabled: true,
          headerShown: false,
          ...TransitionPresets.SlideFromRightIOS,
        }}>
        {isLoggedIn ? (
          <RootStack.Group>
            <RootStack.Screen
              name={ROOT_STACKS.HOME_STACK}
              component={HomeStack}
              options={{
                animationEnabled: false,
              }}
            />
            <RootStack.Screen
              name={ROOT_STACKS.PROFILE_STACK}
              component={ProfileStack}
              options={{
                gestureEnabled: false,
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
          </RootStack.Group>
        ) : (
          <RootStack.Screen
            name={ROOT_STACKS.AUTH_STACK}
            component={AuthStack}
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
