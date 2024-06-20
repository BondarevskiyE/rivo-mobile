import React from 'react';

import {Pressable, StyleSheet, Text} from 'react-native';

import {Colors, Fonts} from '@/shared/ui';
import {withChildren} from '@/shared/types';

type Props = {
  onPress: () => void;
  text: string;
} & withChildren;

export const Button = ({onPress, text, children}: Props) => {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      {children}
      {text && <Text style={styles.buttonText}>{text}</Text>}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    backgroundColor: Colors.ui_dark_blue,
    borderRadius: 18,
    height: 48,
    alignSelf: 'stretch',
  },
  buttonText: {
    fontFamily: Fonts.medium,
    color: Colors.ui_white,
  },
  buttonIcon: {
    position: 'absolute',
    left: 16,
    width: 20,
    height: 20,
  },
});
