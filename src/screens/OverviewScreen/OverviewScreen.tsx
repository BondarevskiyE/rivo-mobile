import React from 'react';
import {Button, StyleSheet, Text, View, ScrollView} from 'react-native';

import {Colors} from '@/shared/ui';
import {useUserStore} from '@/store/useUserStore';
import {useLoginStore} from '@/store/useLoginStore';

export const OverviewScreen = () => {
  const logout = useLoginStore(state => state.logout);

  const walletAddress = useUserStore(state => state.walletAddress);

  return (
    <ScrollView style={styles.Container}>
      <View style={styles.Wrapper}>
        <Button title="Log Out" onPress={logout} />
        <Text>{`address: ${walletAddress}`}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  Container: {
    backgroundColor: Colors.ui_background,
  },
  Wrapper: {
    backgroundColor: Colors.ui_background,
    flex: 1,
    padding: 40,
    width: '100%',
  },
});
