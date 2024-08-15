import {useVaultsStore} from '@/store/useVaultsStore';
import React, {Fragment} from 'react';
import {View, StyleSheet} from 'react-native';
import {VaultItem} from './VaultItem';
import {Colors} from '@/shared/ui';

export const VaultsList = () => {
  const vaults = useVaultsStore(state => state.vaults);

  return (
    <View style={styles.container}>
      {vaults.map((vault, index) => {
        const isLastItem = index === vaults.length - 1;
        return (
          <Fragment key={vault.name}>
            <VaultItem item={vault} />
            {!isLastItem && <View style={styles.divider} />}
          </Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  divider: {
    width: '100%',
    height: 0.5,
    backgroundColor: Colors.ui_grey_13,
  },
});
