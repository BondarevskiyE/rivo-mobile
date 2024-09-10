import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import { SvgUri } from 'react-native-svg';

import {Colors, Fonts} from '@/shared/ui';

interface Props {
  imgUrl: string;
  name: string;
}

export const SourceTag: React.FC<Props> = ({imgUrl, name}) => {
  return (
    <View style={styles.container}>
      <SvgUri uri={imgUrl} style={styles.image} width={20} height={20} />
      <Text style={styles.text}>{name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 4,
    paddingRight: 8,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.ui_grey_03,
    gap: 4,
  },
  image: {
    width: 20,
    height: 20,
  },
  text: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 20.3,
  },
});
