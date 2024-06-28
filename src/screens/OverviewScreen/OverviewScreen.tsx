import React from 'react';
import {
  Button,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
} from 'react-native';

import {Colors} from '@/shared/ui';
import {useUserStore} from '@/store/useUserStore';
import {useLoginStore} from '@/store/useLoginStore';
import {Header} from './components';
import {CardWallet} from '@/components';

const {height} = Dimensions.get('screen');

export const OverviewScreen = () => {
  const logout = useLoginStore(state => state.logout);

  const walletAddress = useUserStore(state => state.walletAddress);

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView>
        <View style={styles.cardWalletContainer}>
          <CardWallet />
        </View>
        <Button title="Log Out" onPress={logout} />
        <Text>{`address: ${walletAddress}`}</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.ui_background,
    height,
    paddingTop: 7,
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  cardWalletContainer: {
    width: '73%',
    alignSelf: 'center',
    marginVertical: 40,
  },
});
