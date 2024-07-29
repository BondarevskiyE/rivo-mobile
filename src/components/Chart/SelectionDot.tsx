import React, {useCallback, useState} from 'react';
import {
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  withSpring,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  Circle,
  Group,
  Paint,
  RoundedRect,
  Text,
  matchFont,
} from '@shopify/react-native-skia';
import {SelectionDotProps} from 'react-native-graph';
import {Colors} from '@/shared/ui';
import {Dimensions, Platform} from 'react-native';

export const CIRCLE_RADIUS = 8;

export const TOOLTIP_HEIGHT_MULTIPLIER = 3.125;
export const TOOLTIP_WIDTH_MULTIPLIER = 11.85;

export const TOOLTIP_CIRCLE_PADDING = 6;

const {width} = Dimensions.get('window');

const fontFamily = Platform.select({ios: 'Helvetica', default: 'serif'});

export function SelectionDot({
  isActive,
  color,
  selectedPoint,
  circleX,
  circleY,
}: SelectionDotProps): React.ReactElement {
  const [activeDot, setActiveDot] = useState(false);
  const circleRadius = useSharedValue(0);

  const tooltipPosition = useSharedValue(0);

  const tooltipHeight = useDerivedValue(
    () => circleRadius.value * TOOLTIP_HEIGHT_MULTIPLIER,
    [circleRadius],
  );

  const tooltipWidth = useDerivedValue(
    () => circleRadius.value * TOOLTIP_WIDTH_MULTIPLIER,
    [circleRadius],
  );

  const tooltipX = useDerivedValue(() => {
    const x = circleX.value + CIRCLE_RADIUS + TOOLTIP_CIRCLE_PADDING;
    if (x > width / 2) {
      tooltipPosition.value = withTiming(
        tooltipWidth.value + CIRCLE_RADIUS * 2 + TOOLTIP_CIRCLE_PADDING * 2,
      );
    } else {
      tooltipPosition.value = withTiming(0);
    }
    return x - tooltipPosition.value;
  }, [circleRadius]);

  const tooltipY = useDerivedValue(() => circleY.value - 12.5, [circleRadius]);

  const tooltipTextX = useDerivedValue(() => tooltipX.value + 8, [tooltipX]);
  const tooltipTextY = useDerivedValue(
    () => tooltipY.value + 4 + 12,
    [tooltipX],
  );

  const setIsActive = useCallback(
    (active: boolean) => {
      circleRadius.value = withSpring(active ? CIRCLE_RADIUS : 0, {
        mass: 1,
        stiffness: 1000,
        damping: 50,
        velocity: 0,
      });
      setActiveDot(active);
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

  const fontStyle = {
    fontFamily,
    fontSize: circleRadius.value ? 12 : 0,
  };
  const font = matchFont(fontStyle);

  const date = new Date(selectedPoint?.date).toLocaleString('en-GB', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const tooltipText = `${date}`;

  return (
    <Group>
      {selectedPoint && (
        <>
          <RoundedRect
            x={tooltipX}
            y={tooltipY}
            width={tooltipWidth}
            height={tooltipHeight}
            opacity={0.7}
            r={30}
          />
          {activeDot && (
            <Text
              x={tooltipTextX}
              y={tooltipTextY}
              color={Colors.ui_grey_40}
              font={font}
              text={tooltipText}
            />
          )}
        </>
      )}

      <Circle cx={circleX} cy={circleY} r={circleRadius} color={color}>
        <Paint color={Colors.ui_white} style="stroke" strokeWidth={2} />
      </Circle>
    </Group>
  );
}
