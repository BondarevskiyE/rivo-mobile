import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import React from 'react';
import {View, StyleSheet} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import {TabIcon} from './TabIcon';
import {Colors} from '@/shared/ui';
import {HOME_SCREEN_TABS} from '@/navigation/types/homeStack';
import {Route} from '@react-navigation/native';
import {TabList} from './TabList';
import {openDepositAndWithdrawalModal} from '@/modal-manager/modals/DepositAndWithdrawalModal';
import {useAppState} from '@/shared/hooks/useAppState';

export const TABBAR_HEIGHT = 56;
export const TABBAR_BOTTOM_OFFSET = 20;

export const TabBar: React.FC<BottomTabBarProps> = ({state, navigation}) => {
  const plusTabValue = useSharedValue(0);

  const onClosePlusTab = () => {
    plusTabValue.value = withSpring(0, {
      stiffness: 90,
      damping: 20,
      mass: 1,
    });
  };

  const onOpenPlusTab = () => {
    plusTabValue.value = withSpring(1, {
      stiffness: 90,
      damping: 20,
      mass: 1,
    });

    setTimeout(() => {
      openDepositAndWithdrawalModal({onHide: onClosePlusTab});
    }, 200);
  };

  const onPressTab = (route: Route<string>, isFocused: boolean) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name, route.params);
    }
  };

  // play close animation when user went to background. Because modals will be closed
  useAppState({
    onBackground: () => {
      onClosePlusTab();
    },
  });

  const leftSideRoutesStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(plusTabValue.value, [0, 1], [0, 150]),
      },
      {
        scale: interpolate(plusTabValue.value, [0, 1], [1, 0.7]),
      },
    ],
  }));

  const rightSideRoutesStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(plusTabValue.value, [0, 1], [0, -150]),
      },
      {
        scaleY: interpolate(plusTabValue.value, [0, 1], [1, 0.7]),
      },
    ],
  }));

  const plusRotateTabStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${interpolate(plusTabValue.value, [0, 1], [0, 45])}deg`,
      },
    ],
  }));

  const plusScaleTabStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scaleX: interpolate(
          plusTabValue.value,
          [0, 0.9, 1],
          [1, 0.9, 1],
          Extrapolation.EXTEND,
        ),
      },
    ],
  }));

  const routesLength = state.routes.length;

  const isOddRoutesLength = routesLength % 2 === 0;

  const middleTabIndex = isOddRoutesLength
    ? routesLength / 2
    : routesLength / 2 + 1;

  const leftSideRoutes = state.routes.slice(0, middleTabIndex);
  const rightSideRoutes = state.routes.slice(middleTabIndex, routesLength);

  return (
    <View style={styles.container}>
      <View style={[styles.tabListContainer, {paddingLeft: 30, right: -40}]}>
        <Animated.View
          style={[
            styles.tabListBackground,
            styles.tabListRadiusLeft,
            {paddingRight: 40},
            leftSideRoutesStyle,
          ]}>
          <TabList
            routes={leftSideRoutes}
            onPress={onPressTab}
            currentTabIndex={state.index}
          />
        </Animated.View>
      </View>
      <Animated.View style={[styles.plusTab, plusScaleTabStyle]}>
        <Animated.View style={plusRotateTabStyle}>
          <TabIcon
            tabName={HOME_SCREEN_TABS.PLUS}
            onPress={onOpenPlusTab}
            isFocused={false}
          />
        </Animated.View>
      </Animated.View>
      <View style={[styles.tabListContainer, {paddingRight: 30, left: -40}]}>
        <Animated.View
          style={[
            styles.tabListBackground,
            {paddingLeft: 40},
            styles.tabListRadiusRight,
            rightSideRoutesStyle,
          ]}>
          <TabList
            routes={rightSideRoutes}
            onPress={onPressTab}
            // we start count from the middle of the routes array
            currentTabIndex={state.index - middleTabIndex}
          />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 'auto',
    alignSelf: 'center',
    bottom: TABBAR_BOTTOM_OFFSET,

    flexDirection: 'row',
    gap: 8,
    zIndex: 9999,
  },
  plusTab: {
    justifyContent: 'center',
    zIndex: 2,
  },
  tabListContainer: {
    overflow: 'hidden',
  },
  tabListBackground: {
    position: 'relative',
    padding: 4,

    backgroundColor: Colors.ui_beige_30,
  },
  tabListRadiusLeft: {
    borderTopLeftRadius: 50,
    borderBottomLeftRadius: 50,
  },
  tabListRadiusRight: {
    borderTopRightRadius: 50,
    borderBottomRightRadius: 50,
  },
});
