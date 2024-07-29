import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import ReAnimated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {Colors, Fonts} from '@/shared/ui';
import {Dropdown, LineChart} from '@/components';
import {ChartRangeOptions} from './ChartRangeOptions';
import {formatValue} from '@/shared/lib';
import {DropdownItem} from '@/components/DropDown/DropDown';

interface Props {
  focusChartSlide: () => void;
  scrollY: SharedValue<number>;
  isChartOpen: boolean;
  changeDragBlockSize: (isBig: boolean) => void;
}

export enum CHART_PERIODS {
  WEEK = '1W',
  MONTH = '1M',
  THREE_MONTHS = '3M',
  MAX = 'max',
}

const dropdownVariants = [
  {label: 'Balance', value: 'balance'},
  {label: 'Price', value: 'price'},
  {label: 'TVL', value: 'tvl'},
  {label: 'APY', value: 'apy'},
];

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
  isChartOpen,
  changeDragBlockSize,
}) => {
  const chartContainerSizeValue = useSharedValue(0);

  const [selectedPeriod, setSelectedPeriod] = useState<CHART_PERIODS>(
    CHART_PERIODS.WEEK,
  );
  const [selectedChartType, setSelectedChartType] = useState(
    dropdownVariants[1].value,
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

  const onSelectDropdownOption = (option: DropdownItem) => {
    focusChartSlide();
    setSelectedChartType(option.value);
    if (option.value === 'balance') {
      changeDragBlockSize(true);
      return;
    }
    changeDragBlockSize(false);
  };

  const isPositiveChangePercent = +changePercent > 0;

  const changePercentColor = isPositiveChangePercent
    ? Colors.ui_green_45
    : Colors.ui_grey_74;

  const isBalanceChart = selectedChartType === 'balance';

  useEffect(() => {
    if (isBalanceChart) {
      chartContainerSizeValue.value = withTiming(459);
      return;
    }
    chartContainerSizeValue.value = withTiming(390);
  }, [chartContainerSizeValue, isBalanceChart]);

  return (
    <Pressable onPress={focusChartSlide}>
      <ReAnimated.View
        style={[
          styles.container,
          {height: chartContainerSizeValue},
          containerStyle,
        ]}>
        <View style={styles.topMenu}>
          <View style={styles.topMenuMain}>
            <View>
              <Text style={styles.chartValue}>${formatValue(shownValue)}</Text>
              {!isBalanceChart && (
                <Text
                  style={[
                    styles.chartChangePercent,
                    {color: changePercentColor},
                  ]}>
                  {`${isPositiveChangePercent ? '+' : ''}${changePercent}%`}
                </Text>
              )}
            </View>
            <Dropdown
              data={dropdownVariants}
              initialSelected={dropdownVariants[1]}
              onSelect={onSelectDropdownOption}
              dropdownPosition={isChartOpen ? 'bottom' : 'top'}
            />
          </View>
          {isBalanceChart && (
            <>
              <View style={styles.totalEarnedContainer}>
                <Text style={styles.textTitle}>Yield Earned:</Text>
                <Text style={styles.totalEarnedValue}>+3.8% • $12.2</Text>
              </View>
              <View style={styles.pointsContainer}>
                <Text style={styles.textTitle}>Rivo Points earned:</Text>
                <Text style={styles.pointsValueText}>+18</Text>
              </View>
            </>
          )}
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
    zIndex: 2,
  },
  topMenuMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  dropdown: {
    minWidth: 77,
    height: 36,
  },
  rangePickerContainer: {
    marginTop: 20,
  },
  totalEarnedContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsContainer: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textTitle: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 20.3,
    color: Colors.grey_text,
  },
  totalEarnedValue: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 20.3,
    color: Colors.ui_green_45,
  },
  pointsValueText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 20.3,
    color: Colors.ui_orange_80,
  },
});
