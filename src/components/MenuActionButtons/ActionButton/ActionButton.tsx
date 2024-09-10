import {Pressable, StyleSheet, Text, View} from 'react-native';

import {ActionMenuButton} from '../types';
import {Colors, Fonts} from '@/shared/ui';
import {ArrowLineIcon, DiogonalArrowIcon} from '@/shared/ui/icons';

type Props = ActionMenuButton & {
  isLastItem: boolean;
};

export function ActionButton({Icon, title, type, action, isLastItem}: Props) {
  const onPress = () => {
    action();
  };

  return (
    <Pressable
      onPress={onPress}
      style={[styles.container, {borderBottomWidth: isLastItem ? 0 : 0.5}]}>
      <View style={styles.contentContainer}>
        <Icon
          color={Colors.ui_grey_70}
          width={21}
          height={21}
          style={styles.icon}
        />
        <Text style={styles.titleText}>{title}</Text>
      </View>

      <View>
        {type === 'link' ? (
          <DiogonalArrowIcon color={Colors.ui_grey_43} width={12} height={12} />
        ) : (
          <ArrowLineIcon color={Colors.ui_grey_43} width={12} height={12} />
        )}
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
