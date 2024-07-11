import React from 'react';
import {StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
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
  PassCodeScreen,
} from '@/screens';

import {useLoginStore} from '@/store/useLoginStore';
import {TabBar} from './components';
import LinearGradient from 'react-native-linear-gradient';

export enum HOME_SCREENS {
  HOME_SCREEN = 'home_screen',
}

export enum HOME_SCREEN_TABS {
  OVERVIEW = 'overview',
  LIGHTING = 'lighting',
  PLUS = 'plus',
  CHARTS = 'charts',
  NOTIFICATIONS = 'notifications',
}

export type HomeTabsProps = {
  [HOME_SCREEN_TABS.OVERVIEW]: undefined;
  [HOME_SCREEN_TABS.LIGHTING]: undefined;
  [HOME_SCREEN_TABS.PLUS]: undefined;
  [HOME_SCREEN_TABS.CHARTS]: undefined;
  [HOME_SCREEN_TABS.NOTIFICATIONS]: undefined;
};

export type HomeStackProps = {
  [HOME_SCREENS.HOME_SCREEN]: undefined;
};

const Tab = createBottomTabNavigator<HomeTabsProps>();

// is is here to fix warnings
const CustomTabBar = (props: BottomTabBarProps) => {
  return <TabBar {...props} />;
};

export const HomeStack = () => {
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
        {!isPassCodeEntered && <PassCodeScreen />}
        <SafeAreaView style={styles.safeAreaContainer}>
          <Tab.Navigator
            tabBar={CustomTabBar}
            screenOptions={{
              headerShown: false,
            }}
            sceneContainerStyle={{backgroundColor: 'transparent'}}>
            <Tab.Screen
              name={HOME_SCREEN_TABS.OVERVIEW}
              component={OverviewScreen}
            />
            <Tab.Screen
              name={HOME_SCREEN_TABS.LIGHTING}
              component={LightingScreen}
            />
            <Tab.Screen name={HOME_SCREEN_TABS.PLUS} component={PlusScreen} />
            <Tab.Screen
              name={HOME_SCREEN_TABS.CHARTS}
              component={ChartsScreen}
            />
            <Tab.Screen
              name={HOME_SCREEN_TABS.NOTIFICATIONS}
              component={NotificationsScreen}
            />
          </Tab.Navigator>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
  },
});
