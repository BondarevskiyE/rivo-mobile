
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
  ChartsScreen,
  NotificationsScreen,
} from '@/screens';
import {TabBar} from './components';
import {createStackNavigator} from '@react-navigation/stack';
import {VaultScreen} from '@/screens/home/VaultScreen';
import {moveBottomToTop} from './StyleInterpolators';
import {
  HOME_SCREENS,
  HOME_SCREEN_TABS,
  HomeStackProps,
  HomeTabsProps,
} from './types/homeStack';
import {SwapOrBridgeScreen} from '@/screens/home/SwapOrBridgeScreen';
import {SendScreen} from '@/screens/home/SendScreen';
import {forFade} from './StyleInterpolators/forFade';
import {ReceiveScreen} from '@/screens/home/ReceiveScreen';
import {PurchaseOrSellScreen} from '@/screens/home/PurchaseOrSellScreen';
import {InvestScreen} from '@/screens/home/InvestScreen/InvestScreen';

// import {useAppStore} from '@/store/useAppStore';

const Stack = createStackNavigator<HomeStackProps>();
const Tab = createBottomTabNavigator<HomeTabsProps>();

const TabsRoot = () => {
  // const isAppLoading = useAppStore(state => state.isAppLoading);

  // if (isAppLoading) {
  //   return null; // TODO maybe splash screen instead this
  // }

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
  return (
    <View style={{position: 'relative', flex: 1, zIndex: 2}}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 1)', 'rgba(238, 231, 231, 1)']}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: '100%',
        }}>
        <Stack.Navigator
          screenOptions={{headerShown: false, freezeOnBlur: true}}>
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
          <Stack.Screen
            name={HOME_SCREENS.INVEST_SCREEN}
            component={InvestScreen}
            options={{
              gestureEnabled: false,
              transitionSpec: {
                open: {
                  animation: 'timing',
                  config: {
                    duration: 200,
                  },
                },
                close: {
                  animation: 'timing',
                  config: {
                    duration: 200,
                  },
                },
              },
              cardStyleInterpolator: forFade,
            }}
          />
          <Stack.Screen
            name={HOME_SCREENS.SEND_SCREEN}
            component={SendScreen}
            options={{
              gestureEnabled: false,
              transitionSpec: {
                open: {
                  animation: 'timing',
                  config: {
                    duration: 200,
                  },
                },
                close: {
                  animation: 'timing',
                  config: {
                    duration: 200,
                  },
                },
              },
              cardStyleInterpolator: forFade,
            }}
          />
          <Stack.Screen
            name={HOME_SCREENS.PURCHASE_OR_SELL_SCREEN}
            component={PurchaseOrSellScreen}
            options={{
              gestureEnabled: false,
              transitionSpec: {
                open: {
                  animation: 'timing',
                  config: {
                    duration: 200,
                  },
                },
                close: {
                  animation: 'timing',
                  config: {
                    duration: 200,
                  },
                },
              },
              cardStyleInterpolator: forFade,
            }}
          />
          <Stack.Screen
            name={HOME_SCREENS.RECEIVE_SCREEN}
            component={ReceiveScreen}
            options={{
              gestureEnabled: false,
              transitionSpec: {
                open: {
                  animation: 'timing',
                  config: {
                    duration: 200,
                  },
                },
                close: {
                  animation: 'timing',
                  config: {
                    duration: 200,
                  },
                },
              },
              cardStyleInterpolator: forFade,
            }}
          />
          <Stack.Screen
            name={HOME_SCREENS.SWAP_OR_BRIDGE_SCREEN}
            component={SwapOrBridgeScreen}
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
