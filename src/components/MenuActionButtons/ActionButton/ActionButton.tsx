import {Pressable, StyleSheet, Text, View} from 'react-native';

import {ActionMenuButton, ButtonType, isSwitchElement} from '../types';
import {Colors, Fonts} from '@/shared/ui';
import {DiogonalArrowIcon} from '@/shared/ui/icons';
import {Switch} from '@/components/Switch';

interface Props {
  button: ActionMenuButton;
  isLastItem: boolean;
}

export function ActionButton({button, isLastItem}: Props) {
  const {Icon, title, type} = button;

  const isSwitchButton = isSwitchElement(button);

  const onPress = () => {
    if (!isSwitchButton) {
      button.action();
    }
  };

  return (
    <Pressable
      onPress={onPress}
      style={[styles.container, {borderBottomWidth: isLastItem ? 0 : 0.5}]}>
      <View style={styles.contentContainer}>
        {Icon ? (
          <Icon
            color={Colors.ui_grey_70}
            width={21}
            height={21}
            style={styles.icon}
          />
        ) : (
          <View style={[styles.icon, {width: 21, height: 21}]} />
        )}
        <Text style={styles.titleText}>{title}</Text>
      </View>

      <View style={styles.contentContainer}>
        {isSwitchButton && (
          <Switch onValueChange={button.action} value={button.isEnabled} />
        )}
        {(type === ButtonType.LINK ||
          type === ButtonType.IN_APP_BROWSER_LINK) && (
          <DiogonalArrowIcon color={Colors.ui_grey_43} width={12} height={12} />
        )}

        {/* {type === ButtonType.INTERNAL && (
          <ArrowLineIcon color={Colors.ui_grey_43} width={12} height={12} />
        )} */}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 22,
    paddingHorizontal: 14,
    backgroundColor: Colors.ui_white,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    borderBottomColor: Colors.ui_grey_13,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
  },
  titleText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: Colors.ui_black_80,
  },
  arrowIcon: {},
});
