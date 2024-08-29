import React from 'react';
import {Route} from '@react-navigation/native';

import {HOME_SCREEN_TABS} from '@/navigation/types/homeStack';
import {TabIcon} from '../TabIcon';
import {StyleSheet, View} from 'react-native';

interface Props {
  routes: Route<string>[];
  onPress: (route: Route<string>, isFocused: boolean) => void;
  currentTabIndex: number;
}

export const TabList: React.FC<Props> = ({
  routes,
  onPress,
  currentTabIndex,
}) => {
  return (
    <View style={styles.container}>
      {routes.map((route, index) => {
        const label = route.name as HOME_SCREEN_TABS;

        const isFocused = currentTabIndex === index;

        const handlePressTab = () => {
          onPress(route, isFocused);
        };

        return (
          <TabIcon
            tabName={label}
            onPress={handlePressTab}
            isFocused={isFocused}
            key={label}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
});
