import React from 'react';

import {
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
  StyleProp,
  TextStyle,
} from 'react-native';
import Animated, {useSharedValue, withTiming} from 'react-native-reanimated';

import {Colors, Fonts} from '@/shared/ui';
import {withChildren} from '@/shared/types';

const getColor = (type: BUTTON_TYPE) => {
  switch (type) {
    case BUTTON_TYPE.ACTION:
      return Colors.ui_orange_80;
    case BUTTON_TYPE.PRIMAL:
      return Colors.ui_white;
    case BUTTON_TYPE.SECONDARY:
      return Colors.ui_dark_blue;
    case BUTTON_TYPE.ACTION_SECONDARY:
      return Colors.ui_white;
    case BUTTON_TYPE.ACTION_DARK:
      return Colors.ui_orange_80;
  }
};

const getBackgroundColor = (type: BUTTON_TYPE) => {
  switch (type) {
    case BUTTON_TYPE.ACTION:
      return Colors.ui_orange_25;
    case BUTTON_TYPE.PRIMAL:
      return Colors.ui_dark_blue;
    case BUTTON_TYPE.SECONDARY:
      return Colors.transparent;
    case BUTTON_TYPE.ACTION_SECONDARY:
      return Colors.ui_orange_80;
    case BUTTON_TYPE.ACTION_DARK:
      return Colors.ui_brown_90;
  }
};

export enum BUTTON_TYPE {
  PRIMAL,
  SECONDARY,
  ACTION,
  ACTION_SECONDARY,
  ACTION_DARK,
}

type Props = {
  onPress: () => void;
  text: string | React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabledStyle?: StyleProp<ViewStyle>;
  type?: BUTTON_TYPE;
  disabled?: boolean;
  error?: boolean;
} & withChildren;

export const Button = ({
  onPress,
  text,
  type = BUTTON_TYPE.PRIMAL,
  style,
  textStyle,
  disabledStyle,
  disabled = false,
  error = false,
  children,
  ...props
}: Props) => {
  const animatedValue = useSharedValue(1);

  const fadeIn = () => {
    animatedValue.value = withTiming(0.8, {duration: 100});
  };
  const fadeOut = () => {
    animatedValue.value = withTiming(1, {duration: 200});
  };

  const backgroundColor = getBackgroundColor(type);
  const color = getColor(type);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={fadeIn}
      onPressOut={fadeOut}
      disabled={disabled}
      {...props}>
      <Animated.View
        style={[
          styles.button,
          {backgroundColor, opacity: animatedValue},
          disabled && [styles.disabled, disabledStyle],
          style,
          error && styles.errorButton,
        ]}>
        {children}
        {text && (
          <Animated.View>
            <Text
              style={[
                styles.buttonText,
                {color},
                textStyle,
                error && styles.errorText,
              ]}>
              {text}
            </Text>
          </Animated.View>
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'relative',
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    height: 48,
    alignSelf: 'stretch',
  },
  buttonText: {
    fontFamily: Fonts.medium,
  },
  buttonIcon: {
    position: 'absolute',
    left: 16,
    width: 20,
    height: 20,
  },
  disabled: {
    opacity: 0.3,
  },
  errorButton: {
    backgroundColor: Colors.ui_red_40,
    opacity: 1,
  },
  errorText: {
    color: Colors.ui_red_80,
  },
});
