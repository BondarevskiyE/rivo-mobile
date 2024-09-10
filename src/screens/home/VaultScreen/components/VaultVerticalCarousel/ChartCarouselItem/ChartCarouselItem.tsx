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
import {useFetchChart} from '@/shared/hooks';
import {CHART_PERIODS, ChartType} from '@/shared/types/chart';
import {Vault} from '@/shared/types';
import {useUserStore} from '@/store/useUserStore';
import {useBalanceStore} from '@/store/useBalanceStore';
import {getIndexEarnedText} from './helpers';

interface Props {
  focusChartSlide: () => void;
  scrollY: SharedValue<number>;
  isChartOpen: boolean;
  vault: Vault;
  changeDragBlockSize: (isBig: boolean) => void;
}

type DropdownItem = {label: string; value: ChartType};

const defaultDropdowns: DropdownItem[] = [
  {label: 'Price', value: 'price'},
  {label: 'TVL', value: 'tvl'},
  {label: 'APY', value: 'apy'},
];

const getDropdownVariants = (isBalanceExist: boolean): DropdownItem[] => {
  const balanceDropdown: DropdownItem = {label: 'Balance', value: 'balance'};

  if (isBalanceExist) {
    return [balanceDropdown, ...defaultDropdowns];
  }

  return defaultDropdowns;
};

const periods = Object.values(CHART_PERIODS);

export const ChartCarouselItem: React.FC<Props> = ({
  focusChartSlide,
  scrollY,
  isChartOpen,
  vault,
  changeDragBlockSize,
}) => {
  const indexBalance = useBalanceStore(
    state => state.indexesBalanceMap?.[vault.address.toLowerCase()],
  );

  const dropdownVariants = getDropdownVariants(!!indexBalance?.token);

  const [selectedPeriod, setSelectedPeriod] = useState<CHART_PERIODS>(
    CHART_PERIODS.MONTH,
  );
  const [selectedChartTypeDropdown, setSelectedChartTypeDropdown] =
    useState<DropdownItem>(dropdownVariants[0]);

  const chartContainerSizeValue = useSharedValue(0);

  const indexEarned = useBalanceStore(
    state => state.indexesEarnedMap?.[vault.address],
  );

  const userAddress = useUserStore(state => state.walletAddress);

  const {isLoading: isChartLoading, data: chartData} = useFetchChart({
    userAddress,
    vaultAddress: vault.address,
    chain: vault.chain,
    period: selectedPeriod,
    type: selectedChartTypeDropdown.value,
  });

  const [shownValue, setShownValue] = useState<number>(
    chartData?.[chartData.length - 1]?.value,
  );

  const [changePercent, setChangePercent] = useState<string>(
    formatValue(
      (chartData?.[chartData.length - 1]?.value / chartData?.[0]?.value - 1) *
        100,
    ),
  );

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
    // timeout to be in time with animation of drag blog size changing
    setTimeout(() => {
      focusChartSlide();
    }, 300);

    setSelectedChartTypeDropdown(option);
    if (option.value === 'balance') {
      changeDragBlockSize(true);
      return;
    }
    changeDragBlockSize(false);
  };

  const isBalanceChart = selectedChartTypeDropdown.value === 'balance';

  useEffect(() => {
    if (isBalanceChart) {
      chartContainerSizeValue.value = withTiming(459);
      return;
    }
    chartContainerSizeValue.value = withTiming(390);
  }, [chartContainerSizeValue, isBalanceChart]);

  // set changePercent for new chart data
  useEffect(() => {
    setChangePercent(
      formatValue(
        (chartData?.[chartData.length - 1]?.value / chartData?.[0]?.value - 1) *
          100,
      ),
    );
    setShownValue(chartData?.[chartData.length - 1]?.value);
  }, [chartData]);

  // choose balance chart if the user has the index balance
  useEffect(() => {
    if (indexBalance?.token) {
      setSelectedChartTypeDropdown({label: 'Balance', value: 'balance'});
      changeDragBlockSize(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indexBalance?.token]);

  const containerStyle = useAnimatedStyle(() => ({
    paddingTop: interpolate(
      scrollY.value,
      [15, 344],
      [16, 80],
      Extrapolation.CLAMP,
    ),
  }));

  const isPositiveChangePercent = +changePercent > 0;

  const changePercentColor = isPositiveChangePercent
    ? Colors.ui_green_45
    : Colors.ui_grey_74;

  const indexEarnedText = getIndexEarnedText(indexEarned);

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
              <Text style={styles.chartValue}>
                ${formatValue(shownValue || 0)}
              </Text>
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
              selected={selectedChartTypeDropdown}
              onSelect={onSelectDropdownOption}
              dropdownPosition={isChartOpen ? 'bottom' : 'top'}
            />
          </View>
          {isBalanceChart && (
            <>
              <View style={styles.totalEarnedContainer}>
                <Text style={styles.textTitle}>Yield Earned:</Text>
                <Text style={styles.totalEarnedValue}>{indexEarnedText}</Text>
              </View>
              <View style={styles.pointsContainer}>
                <Text style={styles.textTitle}>Rivo Points earned:</Text>
                <Text style={styles.pointsValueText}>+18</Text>
              </View>
            </>
          )}
        </View>
        <LineChart
          data={chartData}
          isLoading={isChartLoading}
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
