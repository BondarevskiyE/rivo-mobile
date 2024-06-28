import {Colors, Fonts} from '@/shared/ui';
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {TooltipArrowIcon} from './TooltipArrowIcon';

interface Props {
  text: string;
}

export const Tooltip = ({text}: Props) => {
  return (
    <View style={styles.container}>
      <TooltipArrowIcon style={styles.arrow} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    maxWidth: 243,
    height: 91,
    backgroundColor: Colors.ui_grey_90,
    borderRadius: 13,
    paddingHorizontal: 8,
    paddingVertical: 10,
    marginTop: 13,
  },
  arrow: {
    position: 'absolute',
    alignSelf: 'center',
    top: -13,
    width: 47,
    height: 13,
  },
  text: {
    color: Colors.ui_white,
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 22,
  },
});
