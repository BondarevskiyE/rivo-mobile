import React from 'react';
import {StyleSheet, Pressable, Text, View} from 'react-native';

import {Colors, Fonts} from '@/shared/ui';
import {ArrowLineIcon} from '@/shared/ui/icons';

interface Props {
  Icon: React.ReactNode;
  title: string;
  text: string;
  onPress: () => void;
  withArrow?: boolean;
}

export const MenuButton: React.FC<Props> = ({
  Icon,
  title,
  text,
  onPress,
  withArrow,
}) => {
  return (
    <Pressable onPress={onPress} style={styles.container}>
      {Icon}

      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.text}>{text}</Text>
      </View>
      {withArrow && (
        <View style={styles.arrowContainer}>
          <ArrowLineIcon color={Colors.ui_grey_70} />
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    paddingHorizontal: 12,
    paddingVertical: 15,
    backgroundColor: Colors.ui_white,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 24,
    marginBottom: 8,
  },
  textContainer: {
    justifyContent: 'space-between',
    marginLeft: 8,
  },
  arrowContainer: {
    position: 'absolute',
    right: 20,
  },
  title: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: Colors.ui_black_75,
    lineHeight: 26,
  },
  text: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.ui_grey_70,
    lineHeight: 18.85,
  },
});
