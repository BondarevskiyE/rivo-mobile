import React from 'react';
import {StyleSheet, View} from 'react-native';
import {GraphPoint, LineGraph} from 'react-native-graph';
import ReAnimated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import {ChartDotElement} from '@/shared/types/chart';
import {Colors, Images} from '@/shared/ui';
import {formatValue} from '@/shared/lib';
import {SelectionDot} from './SelectionDot';

interface Props {
  data: ChartDotElement[];
  onChangeShownValue?: (value: number) => void;
  onChangeChangePercent?: (value: string) => void;
}

export const LineChart: React.FC<Props> = ({
  data,
  onChangeShownValue,
  onChangeChangePercent,
}) => {
  const netImageValue = useSharedValue(0);

  const isProgressive =
    data[data.length - 1].value > data[data.length - 2].value;

  const gradientFillColors = isProgressive
    ? ['rgba(107, 205, 48, 0.04)', 'rgba(107, 205, 48, 0)']
    : ['rgba(116, 116, 116, 0.1)', 'rgba(116, 116, 116, 0)'];

  const playNetScaleAnimation = (value: number) => {
    netImageValue.value = withSpring(value, {
      stiffness: 340,
      damping: 18,
      mass: 1,
    });
  };

  const netImageStyle = useAnimatedStyle(() => ({
    transform: [{scale: interpolate(netImageValue.value, [0, 1], [1.3, 1.1])}],
  }));

  const onPointSelected = (point: GraphPoint, prevPoint?: GraphPoint) => {
    onChangeShownValue?.(point.value);
    prevPoint &&
      onChangeChangePercent?.(
        formatValue((1 - prevPoint.value / point.value) * 100),
      );
  };

  const onGestureEnd = () => {
    playNetScaleAnimation(0);
    onChangeShownValue?.(data[data.length - 1].value);
  };

  return (
    <View style={styles.container}>
      <LineGraph
        points={data}
        animated={true}
        enablePanGesture={true}
        color={isProgressive ? Colors.ui_green_45 : Colors.ui_grey_74}
        style={styles.chart}
        onGestureStart={() => playNetScaleAnimation(1)}
        onGestureEnd={onGestureEnd}
        onPointSelected={onPointSelected}
        gradientFillColors={gradientFillColors}
        SelectionDot={SelectionDot}
        panGestureDelay={200}
      />
      <ReAnimated.Image
        source={Images.chartNet}
        style={[styles.netImage, netImageStyle]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  chart: {
    height: 179,
  },
  netImage: {
    position: 'absolute',
    width: '100%',
    height: 80,
    bottom: 0,
    pointerEvents: 'none',
  },
});
