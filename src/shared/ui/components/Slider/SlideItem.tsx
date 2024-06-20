import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import {CardItem} from './types';
import {Fonts} from '@/shared/ui';

interface Props {
  item: CardItem;
  scrollX: Animated.Value;
  index: number;
}

const {width, height} = Dimensions.get('screen');

export const SlideItem: React.FC<Props> = ({item, scrollX, index}) => {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const right = scrollX.interpolate({
    inputRange,
    outputRange: [-20, 0, 20],
    extrapolate: 'clamp',
  });

  const bottom = scrollX.interpolate({
    inputRange,
    outputRange: [-50, 0, -50],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[styles.container, {right, bottom}]}>
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
      </View>
      <View style={styles.imageContainer}>
        <Image source={item.image} resizeMode="contain" style={styles.image} />
        <LinearGradient
          colors={['rgba(238, 238, 238, 0)', '#EEEEEE']}
          locations={[0, 0.6]}
          style={styles.gradient}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: width - 24,
    height,
    alignItems: 'center',
    bottom: 0,
    right: 0,
  },
  imageContainer: {
    position: 'relative',
    flex: 0.65,
    width: '100%',
  },
  image: {
    flex: 1,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontFamily: Fonts.extraBold,
    textAlign: 'center',
  },
  content: {
    alignItems: 'center',
    marginBottom: 20,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    height: 300,
    width,
  },
});
