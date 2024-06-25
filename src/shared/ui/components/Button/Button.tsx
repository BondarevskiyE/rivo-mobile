import React, {useRef} from 'react';

import {Pressable, StyleSheet, Text, Animated} from 'react-native';

import {Colors, Fonts} from '@/shared/ui';
import {withChildren} from '@/shared/types';

type Props = {
  onPress: () => void;
  text: string;
} & withChildren;

export const Button = ({onPress, text, children, ...props}: Props) => {
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

  return (
    <Pressable
      onPress={onPress}
      onPressIn={fadeIn}
      onPressOut={fadeOut}
      {...props}>
      <Animated.View style={[styles.button, {opacity: animated}]}>
        {children}
        {text && <Text style={styles.buttonText}>{text}</Text>}
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
