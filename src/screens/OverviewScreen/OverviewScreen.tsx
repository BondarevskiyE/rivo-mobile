import React from 'react';
import {StyleSheet, View, ScrollView, Dimensions} from 'react-native';

import {Header} from './components';
import {CardWallet} from '@/components';
import {OnboardingTasks} from '@/components/onboarding';
import {CashAccount, StrategiesList} from './components';

const {height} = Dimensions.get('window');

export const OverviewScreen = () => {
  return (
    <View style={styles.container}>
      <Header />

      <ScrollView style={styles.scroll}>
        <View style={styles.cardWalletContainer}>
          <CardWallet />
        </View>
        <OnboardingTasks />
        <CashAccount />
        <StrategiesList />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // backgroundColor: Colors.ui_background,
    height,
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  cardWalletContainer: {
    width: '73%',
    alignSelf: 'center',
    marginVertical: 40,
  },
  scroll: {
    overflow: 'visible',
  },
});
