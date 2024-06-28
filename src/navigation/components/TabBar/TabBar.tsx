import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import React from 'react';
import {View, StyleSheet} from 'react-native';
import {TabIcon} from './TabIcon';
import {TABS} from '@/navigation/AppStack';
import {Colors} from '@/shared/ui';

export const TabBar: React.FC<BottomTabBarProps> = ({state, navigation}) => {
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const label = route.name as TABS;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <TabIcon
            tabName={label}
            onPress={onPress}
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
    position: 'absolute',
    width: 'auto',
    alignSelf: 'center',
    bottom: 20,

    flexDirection: 'row',
    gap: 8,

    padding: 4,

    borderRadius: 50,
    backgroundColor: Colors.ui_beige_30,
  },
});
