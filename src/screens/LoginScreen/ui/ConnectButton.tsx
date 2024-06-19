import React from 'react';

import {Pressable, StyleSheet, Text} from 'react-native';

import {GoogleIcon, TwitterIcon} from '../../../shared/ui/icons';
import {Colors, Fonts} from '../../../shared/constants';

interface Props {
  onPress: () => void;
  text: string;
  icon: 'google' | 'twitter';
}

export const ConnectButton = ({onPress, text, icon}: Props) => {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      {icon === 'google' ? (
        <GoogleIcon style={styles.buttonIcon} />
      ) : (
        <TwitterIcon style={styles.buttonIcon} />
      )}
      <Text style={styles.buttonText}>{text}</Text>
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
