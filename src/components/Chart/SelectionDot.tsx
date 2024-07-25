import React, {useCallback} from 'react';
import {
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  withSpring,
  useDerivedValue,
} from 'react-native-reanimated';
import {Circle, Group, Paint} from '@shopify/react-native-skia';
import {SelectionDotProps} from 'react-native-graph';
import {Colors} from '@/shared/ui';

export const CIRCLE_RADIUS = 8;
export const CIRCLE_RADIUS_MULTIPLIER = 6;

export function SelectionDot({
  isActive,
  color,
  circleX,
  circleY,
}: SelectionDotProps): React.ReactElement {
  const circleRadius = useSharedValue(0);
  const circleStrokeRadius = useDerivedValue(
    () => circleRadius.value * CIRCLE_RADIUS_MULTIPLIER,
    [circleRadius],
  );

  const setIsActive = useCallback(
    (active: boolean) => {
      circleRadius.value = withSpring(active ? CIRCLE_RADIUS : 0, {
        mass: 1,
        stiffness: 1000,
        damping: 50,
        velocity: 0,
      });
    },
    [circleRadius],
  );

  useAnimatedReaction(
    () => isActive.value,
    active => {
      runOnJS(setIsActive)(active);
    },
    [isActive, setIsActive],
  );

  return (
    <Group>
      <Circle
        opacity={0.05}
        cx={circleX}
        cy={circleY}
        r={circleStrokeRadius}
        color="#333333"
      />

      <Circle cx={circleX} cy={circleY} r={circleRadius} color={color}>
        <Paint color={Colors.ui_white} style="stroke" strokeWidth={2} />
      </Circle>
    </Group>
  );
}
