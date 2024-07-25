import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import ReAnimated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

import {Colors, Fonts} from '@/shared/ui';
import {DropDown, LineChart} from '@/components';
import {ChartRangeOptions} from './ChartRangeOptions';
import {formatValue} from '@/shared/lib';

interface Props {
  focusChartSlide: () => void;
  scrollY: SharedValue<number>;
}

export enum CHART_PERIODS {
  WEEK = '1W',
  MONTH = '1M',
  THREE_MONTHS = '3M',
  MAX = 'max',
}

const chartMock = {
  [CHART_PERIODS.WEEK]: [
    {
      value: 1.707,
      date: new Date('2024-07-23'),
    },
    {
      value: 1.8258199575816024,
      date: new Date('2024-07-22'),
    },
    {
      value: 1.7089297629960172,
      date: new Date('2024-07-21'),
    },
    {
      value: 1.708974174971757,
      date: new Date('2024-07-20'),
    },
    {
      value: 1.6748980772223065,
      date: new Date('2024-07-19'),
    },
    {
      value: 1.6592356858155595,
      date: new Date('2024-07-18'),
    },
    {
      value: 1.668070327647913,
      date: new Date('2024-07-17'),
    },
  ],
  [CHART_PERIODS.MONTH]: [
    {
      value: 1.707,
      date: new Date('2024-07-23'),
    },
    {
      value: 1.6258199575816024,
      date: new Date('2024-07-22'),
    },
    {
      value: 1.9089297629960172,
      date: new Date('2024-07-21'),
    },
    {
      value: 1.108974174971757,
      date: new Date('2024-07-20'),
    },
    {
      value: 1.2748980772223065,
      date: new Date('2024-07-19'),
    },
    {
      value: 1.4592356858155595,
      date: new Date('2024-07-18'),
    },
    {
      value: 1.268070327647913,
      date: new Date('2024-07-17'),
    },
  ],
  [CHART_PERIODS.THREE_MONTHS]: [
    {
      value: 1.107,
      date: new Date('2024-07-23'),
    },
    {
      value: 1.3258199575816024,
      date: new Date('2024-07-22'),
    },
    {
      value: 1.8089297629960172,
      date: new Date('2024-07-21'),
    },
    {
      value: 1.508974174971757,
      date: new Date('2024-07-20'),
    },
    {
      value: 1.4748980772223065,
      date: new Date('2024-07-19'),
    },
    {
      value: 1.6592356858155595,
      date: new Date('2024-07-18'),
    },
    {
      value: 1.768070327647913,
      date: new Date('2024-07-17'),
    },
  ],
  [CHART_PERIODS.MAX]: [
    {
      value: 1.107,
      date: new Date('2024-07-23'),
    },
    {
      value: 1.2258199575816024,
      date: new Date('2024-07-22'),
    },
    {
      value: 1.5089297629960172,
      date: new Date('2024-07-21'),
    },
    {
      value: 1.408974174971757,
      date: new Date('2024-07-20'),
    },
    {
      value: 1.5748980772223065,
      date: new Date('2024-07-19'),
    },
    {
      value: 1.6592356858155595,
      date: new Date('2024-07-18'),
    },
    {
      value: 1.168070327647913,
      date: new Date('2024-07-17'),
    },
  ],
};

const periods = Object.values(CHART_PERIODS);

export const ChartCarouselItem: React.FC<Props> = ({
  focusChartSlide,
  scrollY,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<CHART_PERIODS>(
    CHART_PERIODS.WEEK,
  );
  const [shownValue, setShownValue] = useState<number>(
    chartMock[selectedPeriod][chartMock[selectedPeriod].length - 1].value,
  );

  const [changePercent, setChangePercent] = useState<string>(
    formatValue(
      (1 -
        chartMock[selectedPeriod][chartMock[selectedPeriod].length - 2].value /
          chartMock[selectedPeriod][chartMock[selectedPeriod].length - 1]
            .value) *
        100,
    ),
  );

  const containerStyle = useAnimatedStyle(() => ({
    paddingTop: interpolate(
      scrollY.value,
      [15, 344],
      [16, 80],
      Extrapolation.CLAMP,
    ),
  }));

  const onChangeChartPeriod = (period: CHART_PERIODS) => {
    setSelectedPeriod(period);
  };

  const onChangeShownValue = (value: number) => {
    setShownValue(value);
  };

  const onChangeChangePercent = (value: string) => {
    setChangePercent(value);
  };

  const isPositiveChangePercent = +changePercent > 0;

  const changePercentColor = isPositiveChangePercent
    ? Colors.ui_green_45
    : Colors.ui_grey_74;

  return (
    <Pressable onPress={focusChartSlide}>
      <ReAnimated.View style={[styles.container, containerStyle]}>
        <View style={styles.topMenu}>
          <View>
            <Text style={styles.chartValue}>${formatValue(shownValue)}</Text>
            <Text
              style={[styles.chartChangePercent, {color: changePercentColor}]}>
              {`${isPositiveChangePercent ? '+' : ''}${changePercent}%`}
            </Text>
          </View>
          <DropDown
            label="Price"
            data={[{label: 'Price', value: 'price'}]}
            onSelect={() => {}}
            containerStyle={styles.dropdown}
          />
        </View>
        <LineChart
          data={chartMock[selectedPeriod]}
          onChangeShownValue={onChangeShownValue}
          onChangeChangePercent={onChangeChangePercent}
        />
        <View style={styles.rangePickerContainer}>
          <ChartRangeOptions
            selectedPeriod={selectedPeriod}
            periods={periods}
            onChangePeriod={onChangeChartPeriod}
          />
        </View>
      </ReAnimated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 390,
    width: '100%',
    padding: 12,
    paddingTop: 16,
    borderRadius: 32,
    backgroundColor: Colors.ui_black_65,
  },
  chart: {
    flex: 1,
  },
  chartValue: {
    fontFamily: Fonts.medium,
    fontSize: 20,
    lineHeight: 20,
    color: Colors.ui_white,

    marginBottom: 3,
  },
  chartChangePercent: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 20.3,
  },
  topMenu: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dropdown: {
    width: 77,
    height: 36,
  },
  rangePickerContainer: {
    marginTop: 20,
  },
});
