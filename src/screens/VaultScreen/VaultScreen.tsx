import {Colors} from '@/shared/ui';
import React, {useCallback} from 'react';
import {StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {HOME_SCREENS, HomeStackProps} from '@/navigation/HomeStack';
import {StackScreenProps} from '@react-navigation/stack';

import {VaultAboutDragBlock, VaultVerticalCarousel} from './components';
import {useStrategiesStore} from '@/store/useStrategiesStore';
import {Strategy} from '@/shared/types';

type Props = StackScreenProps<HomeStackProps, HOME_SCREENS.VAULT_SCREEN>;

export const VaultScreen: React.FC<Props> = ({route}) => {
  const {vaultId} = route.params;

  const strategyById = useStrategiesStore(
    useCallback(
      state => state.strategies.find(item => item.id === vaultId),
      [vaultId],
    ),
    // there couldn't be undefined
  ) as Strategy;

  return (
    <SafeAreaView style={styles.container}>
      <VaultVerticalCarousel vault={strategyById} />
      <VaultAboutDragBlock vault={strategyById} />
    </SafeAreaView>
  );
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ui_black,
  },
});
