import  React, { useEffect } from 'react';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, {G, Circle} from 'react-native-svg';

const AnimatedSvg = Animated.createAnimatedComponent(Svg);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  size?: number;
  color?: string;
}
export const Loader: React.FC<Props> = ({size = 24, color = '#000'}) => {
  const svgValue = useSharedValue(0);
  const animation = useSharedValue(0);

  useEffect(() => {
    svgValue.value = withRepeat(withTiming(1, {duration: 2100}), -1, false);

    animation.value = withRepeat(withTiming(1, {duration: 1500}), -1, false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const circleDasharray = useDerivedValue(
    () =>
      `${interpolate(
        animation.value,
        [0, 0.475, 1],
        [0, size * 1.75, size * 1.75],
      )} 150`,
  );

  const circleDashoffset = useDerivedValue(() =>
    interpolate(
      animation.value,
      [0, 0.475, 1],
      [0, size * -0.66, size * -2.46],
    ),
  );

  const svgStyles = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${interpolate(svgValue.value, [0, 1], [0, 360])}deg`,
      },
    ],
  }));

  return (
    <AnimatedSvg width={size} height={size} stroke={color} style={svgStyles}>
      <G>
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={size * 0.395}
          fill="none"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={circleDasharray}
          strokeDashoffset={circleDashoffset}
        />
      </G>
    </AnimatedSvg>
  );
};
