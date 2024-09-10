

import {StyleSheet} from 'react-native';

import {GoogleIcon, TwitterIcon} from '@/shared/ui/icons';
import {Button} from '../general/Button';

interface Props {
  onPress: () => void;
  text: string;
  icon: 'google' | 'twitter';
  disabled?: boolean;
}

export const ConnectButton = ({onPress, text, icon, disabled}: Props) => {
  return (
    <Button
      text={text}
      onPress={onPress}
      disabled={disabled}
      style={styles.button}>
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
  button: {
    marginBottom: 8,
  },
});
