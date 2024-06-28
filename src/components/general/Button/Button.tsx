import React, {useRef} from 'react';

import {
  Pressable,
  StyleSheet,
  Text,
  Animated,
  ViewStyle,
  StyleProp,
} from 'react-native';

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
  }
};

export enum BUTTON_TYPE {
  PRIMAL,
  SECONDARY,
  ACTION,
}

type Props = {
  onPress: () => void;
  text: string;
  style?: StyleProp<ViewStyle>;
  type?: BUTTON_TYPE;
} & withChildren;

export const Button = ({
  onPress,
  text,
  type = BUTTON_TYPE.PRIMAL,
  style,
  children,
  ...props
}: Props) => {
  const animated = useRef(new Animated.Value(1)).current;
  const fadeIn = () => {
    Animated.timing(animated, {
      toValue: 0.8,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };
  const fadeOut = () => {
    Animated.timing(animated, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const backgroundColor = getBackgroundColor(type);
  const color = getColor(type);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={fadeIn}
      onPressOut={fadeOut}
      {...props}>
      <Animated.View
        style={[styles.button, style, {backgroundColor, opacity: animated}]}>
        {children}
        {text && <Text style={[styles.buttonText, {color}]}>{text}</Text>}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
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
});
