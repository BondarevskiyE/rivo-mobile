import React from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import QRCode from 'react-qr-code';
import Clipboard from '@react-native-clipboard/clipboard';

import {WhiteInfoModal} from './WhiteInfoModal';
import {Button} from '@/components';

interface Props {
  address: string;
}

export const QRDepositModal: React.FC<Props> = ({address}) => {
  const copyAddressToClipboard = () => {
    Clipboard.setString(address);
    Alert.alert('address is copied');
  };

  return (
    <WhiteInfoModal>
      <View style={styles.container}>
        <QRCode
          size={180}
          style={{height: 'auto', maxWidth: '100%', width: '100%'}}
          value={address}
          viewBox={'0 0 180 180'}
        />
        <Text style={styles.address}>{address}</Text>
        <View style={styles.button}>
          <Button onPress={copyAddressToClipboard} text="Copy address" />
        </View>
      </View>
    </WhiteInfoModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  address: {marginVertical: 5},
  button: {
    width: '100%',
  },
});
