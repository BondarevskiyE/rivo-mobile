import React from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import {Images} from '@/shared/ui';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

interface Props {
  value: string;
}

export const QRWithLogo: React.FC<Props> = ({value}) => {
  return (
    <View style={styles.container}>
      <QRCode
        value={value}
        size={SCREEN_WIDTH * 0.65}
        logo={Images.qrLogo}
        logoSize={SCREEN_WIDTH * 0.195}
        logoBorderRadius={16.5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 22,
    overflow: 'hidden',
  },
});
