import React from 'react';
import {View, Pressable, StyleSheet} from 'react-native';
import {getIconByName} from './lib';
import {Colors} from '@/shared/ui';
import {HOME_SCREEN_TABS} from '@/navigation/types/homeStack';

interface Props {
  onPress: () => void;
  tabName: HOME_SCREEN_TABS;
  isFocused: boolean;
}

export const TabIcon: React.FC<Props> = ({onPress, tabName, isFocused}) => {
  const Icon = getIconByName(tabName);
  const isPlusTab = tabName === HOME_SCREEN_TABS.PLUS;

  const backgroundColor = isFocused ? Colors.ui_white : Colors.transparent;
  const iconColor = isFocused ? '#2E221A' : '#C5B1A7';

  return (
    <Pressable onPress={onPress}>
      <View
        style={[
          styles.container,
          {backgroundColor: isPlusTab ? Colors.ui_orange_80 : backgroundColor},
        ]}>
        <Icon color={isPlusTab ? Colors.ui_white : iconColor} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 48,
    height: 48,
    borderRadius: 24,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
