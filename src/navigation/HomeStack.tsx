import React from 'react';
import {StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
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
import {createStackNavigator} from '@react-navigation/stack';
import {VaultScreen} from '@/screens/VaultScreen';
import {moveBottomToTop} from './StyleInterpolators';

export enum HOME_SCREENS {
  HOME_SCREEN = 'home_screen',
  VAULT_SCREEN = 'vault_screen',
}

export type HomeStackProps = {
  [HOME_SCREENS.HOME_SCREEN]: undefined;
  [HOME_SCREENS.VAULT_SCREEN]: {
    vaultId: string;
  };
};

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

const Stack = createStackNavigator<HomeStackProps>();
const Tab = createBottomTabNavigator<HomeTabsProps>();

const TabsRoot = () => {
  return (
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
        <Tab.Screen name={HOME_SCREEN_TABS.CHARTS} component={ChartsScreen} />
        <Tab.Screen
          name={HOME_SCREEN_TABS.NOTIFICATIONS}
          component={NotificationsScreen}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

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
        {/* {!isPassCodeEntered && <PassCodeScreen />} */}
        <Stack.Navigator screenOptions={{headerShown: false}}>
          <Stack.Screen name={HOME_SCREENS.HOME_SCREEN} component={TabsRoot} />
          <Stack.Screen
            name={HOME_SCREENS.VAULT_SCREEN}
            component={VaultScreen}
            options={{
              gestureEnabled: false,
              transitionSpec: {
                open: {
                  animation: 'spring',
                  config: {
                    stiffness: 320,
                    damping: 40,
                    mass: 1,
                  },
                },
                close: {
                  animation: 'spring',
                  config: {
                    stiffness: 320,
                    damping: 40,
                    mass: 1,
                  },
                },
              },
              cardStyleInterpolator: moveBottomToTop,
            }}
          />
        </Stack.Navigator>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
  },
});
