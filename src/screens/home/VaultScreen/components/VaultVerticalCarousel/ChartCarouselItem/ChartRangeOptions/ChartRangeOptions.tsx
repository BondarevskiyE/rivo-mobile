
import {StyleSheet, View} from 'react-native';

import {ChartRangeButton} from './ChartRangeButton';

interface Props<PeriodType> {
  selectedPeriod: PeriodType;
  periods: PeriodType[];
  onChangePeriod: (period: PeriodType) => void;
}

export function ChartRangeOptions<T extends string>({
  selectedPeriod,
  periods,
  onChangePeriod,
}: Props<T>) {
  return (
    <View style={styles.container}>
      {periods.map(period => (
        <ChartRangeButton
          period={period}
          isActive={selectedPeriod === period}
          onPress={onChangePeriod}
          key={period}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flexDirection: 'row',
  },
});
