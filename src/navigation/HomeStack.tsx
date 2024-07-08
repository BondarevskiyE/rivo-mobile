import React from 'react';
import {Platform, View} from 'react-native';
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
import {createStackNavigator} from '@react-navigation/stack';
import {Colors} from '@/shared/ui';
// import {CardCustomizationScreen} from '@/screens/CardCustomizationScreen';

export enum HOME_SCREENS {
  HOME_SCREEN = 'home_screen',
  // CARD_CUSTOMIZATION_SCREEN = 'card_customization',
  PASS_CODE_SCREEN = 'pass_code_screen',
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
  // [HOME_SCREENS.CARD_CUSTOMIZATION_SCREEN]: undefined;
  [HOME_SCREENS.PASS_CODE_SCREEN]: undefined;
};

const Stack = createStackNavigator<HomeStackProps>();
const Tab = createBottomTabNavigator<HomeTabsProps>();

// is is here to fix warnings
const CustomTabBar = (props: BottomTabBarProps) => {
  return <TabBar {...props} />;
};

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
              animationEnabled: Platform.OS === 'android',
            }}>
            {isPassCodeEntered ? (
              <>
                <Stack.Screen
                  name={HOME_SCREENS.HOME_SCREEN}
                  component={TabsRoot}
                />
                {/* <Stack.Screen
                  name={HOME_SCREENS.CARD_CUSTOMIZATION_SCREEN}
                  component={CardCustomizationScreen}
                /> */}
              </>
            ) : (
              <Stack.Screen
                name={HOME_SCREENS.PASS_CODE_SCREEN}
                component={PassCodeScreen}
                options={{presentation: 'transparentModal'}}
              />
            )}
          </Stack.Navigator>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};
