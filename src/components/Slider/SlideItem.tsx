import React from 'react';
import {StyleSheet, Text, View, Image, Dimensions} from 'react-native';
import {CardItem} from './types';

interface Props {
  item: CardItem;
}

const {width, height} = Dimensions.get('screen');

export const SlideItem: React.FC<Props> = ({item}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
      </View>
      <Image source={item.image} resizeMode="contain" style={styles.image} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width,
    height,
    alignItems: 'center',
  },
  image: {
    flex: 0.6,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Nunito-ExtraBold',
    textAlign: 'center',
  },
  content: {
    // flex: 0.4,
    alignItems: 'center',
  },
});
