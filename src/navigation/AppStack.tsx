import React from 'react';
import {SafeAreaView, StyleSheet, View} from 'react-native';
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
        <SafeAreaView style={styles.safeAreaContainer}>
          <Tab.Navigator
            tabBar={CustomTabBar}
            screenOptions={{
              headerShown: false,
            }}
            sceneContainerStyle={{backgroundColor: 'transparent'}}>
            <Tab.Screen name={TABS.OVERVIEW} component={OverviewScreen} />
            <Tab.Screen name={TABS.LIGHTING} component={LightingScreen} />
            <Tab.Screen name={TABS.PLUS} component={PlusScreen} />
            <Tab.Screen name={TABS.CHARTS} component={ChartsScreen} />
            <Tab.Screen
              name={TABS.NOTIFICATIONS}
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
