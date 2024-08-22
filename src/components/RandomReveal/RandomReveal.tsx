import React, {useEffect} from 'react';
import {StyleProp, StyleSheet, Text, TextStyle, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
// import LinearGradient from 'react-native-linear-gradient';
import {RandomReveal as RandomRevealComponent} from 'react-random-reveal';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const defaultDigitsCharactersSet = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
];

interface Props {
  value: string;
  charachtersSet?: string[];
  withGradient?: boolean;
  textStyle?: StyleProp<TextStyle>;
}

export const RandomReveal: React.FC<Props> = ({
  value,
  charachtersSet = defaultDigitsCharactersSet,
  withGradient,
  textStyle,
}) => {
  const gradientValue = useSharedValue(0);

  useEffect(() => {
    gradientValue.value = 1;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const gradientUpStyle = useAnimatedStyle(() => ({
    top: interpolate(gradientValue.value, [0, 1], [-15, 2]),
  }));
  const gradientDownStyle = useAnimatedStyle(() => ({
    bottom: interpolate(gradientValue.value, [0, 1], [-15, 0]),
  }));
  return (
    <View style={styles.container}>
      {withGradient && (
        <AnimatedLinearGradient
          colors={[' rgba(0, 0, 0, 1)', 'rgba(0, 0, 0, 0.1)']}
          start={{x: 1, y: 0}}
          end={{x: 1, y: 1}}
          style={[styles.gradient, gradientUpStyle]}
        />
      )}
      <Text style={textStyle}>
        <RandomRevealComponent
          key={value}
          isPlaying
          characterSet={charachtersSet}
          characters={value}
          revealDuration={0.8}
          duration={0.5}
          onComplete={() => {
            gradientValue.value = withTiming(0);
          }}
        />
      </Text>
      {withGradient && (
        <AnimatedLinearGradient
          colors={[' rgba(0, 0, 0, 1)', 'rgba(0, 0, 0, 0.5)']}
          start={{x: 1, y: 1}}
          end={{x: 1, y: 0}}
          style={[styles.gradient, gradientDownStyle]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  gradient: {
    position: 'absolute',
    height: 6,
    width: 100,
    zIndex: 2,
    opacity: 0.6,
  },
});
