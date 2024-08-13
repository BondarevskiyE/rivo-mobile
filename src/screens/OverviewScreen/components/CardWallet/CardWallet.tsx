import React from 'react';
import {ImageBackground, Pressable, StyleSheet, Text, View} from 'react-native';

import {formatValue} from '@/shared/lib';
import {shortenAddress} from '@/shared/lib/format';
import {Colors, Fonts, Images} from '@/shared/ui';
import {useBalanceStore} from '@/store/useBalanceStore';
import {useUserStore} from '@/store/useUserStore';
import Modal, {QRDepositModal} from '@/modal-manager';

const openQRDepositModal = (address: string) => {
  Modal.show({
    children: <QRDepositModal address={address} />,
    dismissable: true,
    position: 'bottom',
  });
};

export const CardWallet = () => {
  const userBalance = useBalanceStore(state => state.userBalance);
  const totalEarned = useBalanceStore(state => state.totalEarned);
  const walletAddress = useUserStore(state => state.walletAddress);
  const [userBalanceInteger, userBalanceFraction] =
    formatValue(userBalance).split('.');

  return (
    <Pressable
      onPress={() => openQRDepositModal(walletAddress)}
      style={styles.container}>
      <ImageBackground
        source={Images.userCard}
        resizeMode="cover"
        style={styles.image}>
        <View style={styles.flexContainer}>
          <View>
            <View style={styles.balanceContainer}>
              <Text style={styles.dollar}>$</Text>
              <Text style={styles.integer}>{userBalanceInteger}</Text>
              <Text style={styles.fraction}>{`.${
                userBalanceFraction || '00'
              }`}</Text>
            </View>

            <View style={styles.earnedContainer}>
              <Text style={styles.text}>Yield Earned:</Text>
              <View style={styles.earnedValueContainer}>
                <Text style={styles.littleDollar}>$</Text>
                <Text style={styles.earnedValue}>
                  {formatValue(totalEarned)}
                </Text>
              </View>
            </View>
          </View>
          <Text style={styles.address}>{shortenAddress(walletAddress)}</Text>
        </View>
      </ImageBackground>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 156,
    borderRadius: 22,
    overflow: 'hidden',
  },
  image: {
    flex: 1,
    padding: 12,
  },
  flexContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 31,
    marginBottom: 6,
  },
  dollar: {
    fontFamily: Fonts.medium,
    color: Colors.ui_orange_40,
    fontSize: 28,
  },
  integer: {
    fontFamily: Fonts.medium,
    color: Colors.ui_orange_45,
    fontSize: 28,
    height: 31,
  },
  fraction: {
    fontFamily: Fonts.medium,
    color: Colors.ui_orange_45,
    fontSize: 22,
    marginLeft: -2,
    height: 25.5,
  },
  earnedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  text: {
    fontFamily: Fonts.regular,
    color: Colors.ui_orange_45,
    fontSize: 16,
    lineHeight: 22.4,
  },
  earnedValueContainer: {
    flexDirection: 'row',
  },
  littleDollar: {
    fontFamily: Fonts.regular,
    color: Colors.ui_orange_40,
    fontSize: 16,
    lineHeight: 22.4,
  },
  earnedValue: {
    fontFamily: Fonts.regular,
    color: Colors.ui_orange_45,
    fontSize: 16,
    lineHeight: 22.4,
  },
  address: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    lineHeight: 22.4,
    color: Colors.ui_orange_45,
  },
});
