import React from 'react';
import {SafeAreaView, View} from 'react-native';
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

import {
  OverviewScreen,
  LightingScreen,
  PlusScreen,
  ChartsScreen,
  NotificationsScreen,
} from '@/screens';

import {useLoginStore} from '@/store/useLoginStore';
import {PassCode} from '@/components/enter';
import {TabBar} from './components';
import LinearGradient from 'react-native-linear-gradient';
import {createStackNavigator} from '@react-navigation/stack';
import {Colors} from '@/shared/ui';

export enum APP_SCREENS {
  HOME_SCREEN = 'home_screen',
  PASS_CODE_SCREEN = 'pass_code_screen',
}

export enum HOME_SCREEN_TABS {
  OVERVIEW = 'overview',
  LIGHTING = 'lighting',
  PLUS = 'plus',
  CHARTS = 'charts',
  NOTIFICATIONS = 'notifications',
}

export type AppStackProps = {
  [APP_SCREENS.HOME_SCREEN]: undefined;
  [APP_SCREENS.PASS_CODE_SCREEN]: undefined;
};

// is is here to fix warnings
const CustomTabBar = (props: BottomTabBarProps) => {
  return <TabBar {...props} />;
};

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabsRoot = () => (
  <Tab.Navigator
    tabBar={CustomTabBar}
    screenOptions={{
      headerShown: false,
    }}
    sceneContainerStyle={{backgroundColor: 'transparent'}}>
    <Tab.Screen name={HOME_SCREEN_TABS.OVERVIEW} component={OverviewScreen} />
    <Tab.Screen name={HOME_SCREEN_TABS.LIGHTING} component={LightingScreen} />
    <Tab.Screen name={HOME_SCREEN_TABS.PLUS} component={PlusScreen} />
    <Tab.Screen name={HOME_SCREEN_TABS.CHARTS} component={ChartsScreen} />
    <Tab.Screen
      name={HOME_SCREEN_TABS.NOTIFICATIONS}
      component={NotificationsScreen}
    />
  </Tab.Navigator>
);

export const AppStack = () => {
  const isPassCodeEntered = useLoginStore(state => state.isPassCodeEntered);

  return (
    <View style={{position: 'relative', flex: 1}}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 1)', 'rgba(238, 231, 231, 1)']}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: '100%',
        }}>
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: isPassCodeEntered
              ? 'transparent'
              : Colors.ui_background,
          }}>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              gestureEnabled: false,
              animationEnabled: false,
            }}>
            {isPassCodeEntered ? (
              <Stack.Screen
                name={APP_SCREENS.HOME_SCREEN}
                component={TabsRoot}
              />
            ) : (
              <Stack.Screen
                name={APP_SCREENS.PASS_CODE_SCREEN}
                component={PassCode}
                options={{presentation: 'transparentModal'}}
              />
            )}
          </Stack.Navigator>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};
