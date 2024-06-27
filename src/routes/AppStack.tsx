import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
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
import {PassCode} from '@/widgets/enter/';
import {TabBar} from '@/widgets/layout';
import {Colors} from '@/shared/ui';

export enum TABS {
  OVERVIEW = 'overview',
  LIGHTING = 'lighting',
  PLUS = 'plus',
  CHARTS = 'charts',
  NOTIFICATIONS = 'notifications',
}

// is is here to fix warnings
const CustomTabBar = (props: BottomTabBarProps) => {
  return <TabBar {...props} />;
};

const Tab = createBottomTabNavigator();

export const AppStack = () => {
  const isPassCodeEntered = useLoginStore(state => state.isPassCodeEntered);

  if (!isPassCodeEntered) {
    return <PassCode />;
  }

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <Tab.Navigator
        tabBar={CustomTabBar}
        screenOptions={{
          headerShown: false,
        }}>
        <Tab.Screen name={TABS.OVERVIEW} component={OverviewScreen} />
        <Tab.Screen name={TABS.LIGHTING} component={LightingScreen} />
        <Tab.Screen name={TABS.PLUS} component={PlusScreen} />
        <Tab.Screen name={TABS.CHARTS} component={ChartsScreen} />
        <Tab.Screen name={TABS.NOTIFICATIONS} component={NotificationsScreen} />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: Colors.ui_background,
  },
});
