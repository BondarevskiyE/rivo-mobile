import React from 'react';

import {StyleSheet} from 'react-native';

import {GoogleIcon, TwitterIcon} from '@/shared/ui/icons';
import {Button} from '@/components';

interface Props {
  onPress: () => void;
  text: string;
  icon: 'google' | 'twitter';
}

export const ConnectButton = ({onPress, text, icon}: Props) => {
  return (
    <Button text={text} onPress={onPress}>
      {icon === 'google' ? (
        <GoogleIcon style={styles.buttonIcon} />
      ) : (
        <TwitterIcon style={styles.buttonIcon} />
      )}
    </Button>
  );
};

const styles = StyleSheet.create({
  buttonIcon: {
    position: 'absolute',
    left: 16,
    width: 20,
    height: 20,
  },
});
