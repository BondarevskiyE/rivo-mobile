import {useStrategiesStore} from '@/store/useStrategiesStore';
import React, {Fragment} from 'react';
import {View, StyleSheet} from 'react-native';
import {StrategyItem} from './StrategyItem';
import {Colors} from '@/shared/ui';

export const StrategiesList = () => {
  const strategies = useStrategiesStore(state => state.strategies);

  return (
    <View style={styles.container}>
      {strategies.map((strategy, index) => {
        const isLastItem = index === strategies.length - 1;
        return (
          <Fragment key={strategy.name}>
            <StrategyItem item={strategy} />
            {!isLastItem && <View style={styles.divider} />}
          </Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    borderRadius: 24,
    overflow: 'hidden',
  },
  divider: {
    width: '100%',
    height: 0.5,
    backgroundColor: Colors.ui_grey_13,
  },
});
