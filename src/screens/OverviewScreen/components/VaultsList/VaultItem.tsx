import React from 'react';
import {View, Text, StyleSheet, Alert, Pressable} from 'react-native';

import * as RootNavigation from '@/navigation/RootNavigation';
import {Vault} from '@/shared/types';
import {Colors, Fonts} from '@/shared/ui';
import {
  DollarIconWithShadow,
  EthereumCircleIconWithShadow,
} from '@/shared/ui/icons';
import {Button} from '@/components';
import {BUTTON_TYPE} from '@/components/general/Button/Button';
import {HOME_SCREENS} from '@/navigation/types/homeStack';
import {getFormatValue} from '@/shared/lib/format';

interface Props {
  item: Vault;
}

export const VaultItem: React.FC<Props> = ({item}) => {
  const Icon =
    item.logo === 'dollar'
      ? DollarIconWithShadow
      : EthereumCircleIconWithShadow;

  const openVaultScreen = () => {
    RootNavigation.navigate(HOME_SCREENS.VAULT_SCREEN, {vaultId: item.id});
  };

  return (
    <Pressable onPress={openVaultScreen}>
      <View style={styles.container}>
        <View style={styles.upperBlock}>
          <View style={styles.titleBlock}>
            <Icon
              color={Colors.ui_purple_50}
              style={styles.icon}
              shadowColor={'rgba(42, 37, 76, 0.1)'}
              width={36}
              height={36}
              distance={20}
            />
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{`${getFormatValue(
                item.apy,
              )}% APY`}</Text>
              <Text style={styles.subTitle}>{item.name}</Text>
            </View>
          </View>
          <Button
            type={BUTTON_TYPE.ACTION}
            style={styles.button}
            onPress={() => {
              Alert.alert(item.name);
            }}
            text="Earn"
          />
        </View>
        <Text style={styles.description}>{item.shortDescription}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: Colors.ui_white,
  },
  upperBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleContainer: {
    // gap: 2,
  },
  title: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    lineHeight: 22.4,
  },
  subTitle: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.ui_grey_70,
    lineHeight: 20.3,
    letterSpacing: -0.04,
  },
  icon: {
    marginRight: 10,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 7,
    height: 36,
    marginBottom: 0,
  },
  description: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 20.3,
    color: Colors.ui_grey_70,
    letterSpacing: -0.2,
  },
});
